// We use this 'party' to get and broadcast presence information
// from all connected users. We'll use this to show how many people
// are connected to the room, and where they're from.

import type { State } from "../messages";

import type * as Party from "partykit/server";

export default class MyRemix implements Party.Server {
  // eslint-disable-next-line no-useless-constructor
  constructor(public room: Party.Room) {}

  // we'll store the state in memory
  state: State = {
    players: [],
  };
  // let's opt in to hibernation mode, for much higher concurrency
  // like, 1000s of people in a room 🤯
  // This has tradeoffs for the developer, like needing to hydrate/rehydrate
  // state on start, so be careful!
  static options = {
    hibernate: true,
  };

  // This is called every time a new room is made
  // since we're using hibernation mode, we should
  // "rehydrate" this.state here from all connections
  onStart(): void | Promise<void> {
    for (const connection of this.room.getConnections<State>()) {
      console.log('start');
      const players = connection.state!.players;
      this.state = {
        players: [...players],
      };
    }
  }

  // This is called every time a new connection is made
  async onConnect(
    connection: Party.Connection<State>,
    // ctx: Party.ConnectionContext
  ): Promise<void> {
    console.log('connect', this.room.id);
    // Let's read the country from the request context
    // const from = (ctx.request.cf?.country ?? "unknown") as string;
    // and update our state
    this.state = {
      players: [...this.state.players],
    };
    // let's also store where we're from on the connection
    // so we can hydrate state on start, as well as reference it on close
    connection.setState(this.state);
    // finally, let's broadcast the new state to all connections
    this.room.broadcast(JSON.stringify(this.state));
  }

  async onMessage(message: string | ArrayBuffer | ArrayBufferView, sender: Party.Connection): Promise<void> {
    console.log('message');
    const data = JSON.parse(message as string)
    switch (data.message) {
      case 'setPlayer': {
        this.state.players.push({
          id: sender.id,
          ...data.player
        })
        this.room.broadcast(JSON.stringify(this.state));
      }
    }
    console.log(sender);
  }

  // This is called every time a connection is closed
  async onClose(connection: Party.Connection<State>): Promise<void> {
    console.log('close', connection);
    // let's update our state
    // first let's read the country from the connection state
    const players = connection.state!.players;
    // and update our state
    this.state = {
      players: [...players.filter(player => player.id !== connection.id)],
    };
    // finally, let's broadcast the new state to all connections
    this.room.broadcast(JSON.stringify(this.state));
  }

  // This is called when a connection has an error
  async onError(
    connection: Party.Connection<State>,
    err: Error
  ): Promise<void> {
    console.log('error');
    // let's log the error
    console.error(err);
    // and close the connection
    await this.onClose(connection);
  }
}

MyRemix satisfies Party.Worker;
