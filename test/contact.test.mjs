import assert from "node:assert/strict";
import test from "node:test";
import { handleContact } from "../worker.js";

let nextIp = 20;

function post(body, headers = {}) {
  const ip = headers["cf-connecting-ip"] || `203.0.113.${nextIp++}`;
  return new Request("https://beaches.example/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "cf-connecting-ip": ip,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

test("missing secrets do not report a sent message", async () => {
  const response = await handleContact(post({
    name: "Ada",
    email: "ada@example.com",
    message: "A note.",
  }), {});
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.equal(data.ok, false);
  assert.equal(data.error, "The message could not be sent.");
  assert.equal(data.message, undefined);
});

test("a delivered Resend response says the message was sent", async () => {
  const calls = [];
  const response = await handleContact(
    post({
      name: "Ada",
      email: "ada@example.com",
      message: "A note about the record.",
    }),
    {
      RESEND_API_KEY: "re_test_key",
      CONTACT_EMAIL: "inbox@example.com",
    },
    async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ id: "email_123" }), { status: 200 });
    }
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.ok, true);
  assert.equal(data.message, "The message was sent.");
  const payload = JSON.parse(calls[0].options.body);
  assert.equal(payload.to[0], "inbox@example.com");
  assert.equal(payload.from, "Walton County Beach Access <onboarding@resend.dev>");
  assert.equal(payload.reply_to, "ada@example.com");
  assert.equal(calls[0].options.headers.authorization, "Bearer re_test_key");
});

test("CONTACT_FROM overrides the onboarding sender", async () => {
  let payload;
  await handleContact(
    post({
      name: "Ada",
      email: "ada@example.com",
      message: "A note.",
    }),
    {
      RESEND_API_KEY: "re_test_key",
      CONTACT_EMAIL: "inbox@example.com",
      CONTACT_FROM: "Records <records@example.com>",
    },
    async (_url, options) => {
      payload = JSON.parse(options.body);
      return new Response(JSON.stringify({ id: "email_456" }), { status: 200 });
    }
  );
  assert.equal(payload.from, "Records <records@example.com>");
});

test("a Resend failure does not say the message was sent", async () => {
  const response = await handleContact(
    post({
      name: "Ada",
      email: "ada@example.com",
      message: "A note.",
    }),
    {
      RESEND_API_KEY: "re_test_key",
      CONTACT_EMAIL: "inbox@example.com",
    },
    async () => new Response(JSON.stringify({ message: "no" }), { status: 403 })
  );
  assert.equal(response.status, 502);
  const data = await response.json();
  assert.equal(data.ok, false);
  assert.equal(data.error, "The message could not be sent.");
});
