# Deno WebSocket server

A WebSocket server library for handling multiple clients


**Note**: This WebSocket server is **not** an `EventEmitter` (i.e. it does not use events with callbacks like [websockets/ws](https://github.com/websockets/ws)).
Instead, it specifies the [asyncIterator](asyncIterator) symbol and should be used in conjunction with a [`for await...of`](for-await-of), just like the [std/http](https://deno.land/std/http). The iterator yields `WebSocketServerEvent`s which contain both the `WebSocketEvent` and the corresponding `WebSocket` from which the event was received.

## Usage

### Simple server
```ts
import { serve } from 'https://raw.githubusercontent.com/JohanWinther/websocket-server/master/mod.ts'
const server = serve(":8080");
for await (const { event } of server) {
    console.log(event);
}
```

### Echo / broadcast server
Check out the example [echo/broadcast server](./example_server.ts).

## Changelog

GitHub [releases][changelog] is used for changelog entries.

## License
[MIT](LICENSE)

[changelog]: https://github.com/JohanWinther/websocket-server/releases
[asyncIterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator
[for-await-of]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of