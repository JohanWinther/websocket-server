import {
	assertEquals, assertNotEquals,
} from "https://deno.land/std@0.89.0/testing/asserts.ts";
import { delay } from "https://deno.land/std@0.89.0/async/delay.ts";
import {
	WebSocket,
	WebSocketEvent,
} from "https://deno.land/std@0.89.0/ws/mod.ts";
import { serve, WebSocketServer } from "./server.ts";

const { test } = Deno;

// serve
test("that `serve` returns a server", async () => {
	const port = 8123;
	const server = serve({ port });
	await server.close();
});

// server
test("that a `WebSocketServer` receives events from a client", async () => {
	async function saveIterationResults(
		items: { socket: WebSocket; event: WebSocketEvent; }[],
		server: WebSocketServer
	) {
		for await (const wsEvent of server) {
			items.push(wsEvent);
		}
	}

	const port = 8123;
	const server = serve({ port });
	const results: { socket: WebSocket; event: WebSocketEvent; }[] = [];
	saveIterationResults(results, server);

	const msgsPerClient = 4; // The three below plus "connection"
	const client1 = new WebSocket(`ws://127.0.0.1:${port}`);
	await new Promise(resolve => client1.addEventListener('open', resolve))
	const client2 = new WebSocket(`ws://127.0.0.1:${port}`);
	await new Promise(resolve => client2.addEventListener('open', resolve))
	client1.send("client 1");
	await delay(10);
	client2.send("client 2");
	await delay(10);
	client1.send(new Uint8Array([1, 2, 3]));
	await delay(10);
	client2.send(new Uint8Array([4, 5, 6]));
	await delay(10);
	client1.close(3001, "done");
	await delay(10);
	client2.close(3002, "done");
	await delay(10);

	assertEquals(server.sockets.size, 0, "sockets have not been untracked");
	assertEquals(results.length, 2 * msgsPerClient, "not all events were read");

	assertEquals(results[0].socket, results[2].socket, "first sockets");
	assertEquals(results[0].socket, results[4].socket);
	assertEquals(results[1].socket, results[3].socket);
	assertEquals(results[1].socket, results[5].socket);
	assertNotEquals(results[0].socket, results[1].socket);

	assertEquals(results[0].event, "connection"); // client1
	assertEquals(results[1].event, "connection"); // client2
	assertEquals(results[2].event, "client 1");
	assertEquals(results[3].event, "client 2");
	assertEquals(results[4].event, new Uint8Array([1, 2, 3]));
	assertEquals(results[5].event, new Uint8Array([4, 5, 6]));
	assertEquals(results[6].event, { code: 3001, reason: "done" });
	assertEquals(results[7].event, { code: 3002, reason: "done" });

	await server.close();
});
