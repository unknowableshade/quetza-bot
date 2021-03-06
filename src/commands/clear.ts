import Client from "../lib/Client";

import { CommandInteraction } from "discord.js";
import I8n from "../lib/I8n";

export async function run(client: Client, ctx: CommandInteraction) {
    if (!ctx.guild || !ctx.channel) return;

    const player = client.modules.music.get(ctx.guild.id, ctx.channel);

    if (!player) return;

    const amount = player.Queue.Tracks.length;

    player.clear();

    await ctx.reply({ embeds: [I8n.en.cleared(amount)] });
}

const data = {
    name: "clear",
    description: "Clears the player's queue.",
};

export { data };
