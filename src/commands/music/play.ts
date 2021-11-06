import { design } from "../../config";

import { ColorResolvable, CommandInteraction, MessageEmbed } from "discord.js";
import { MyClient } from "../../types/Client";
import { run as connect } from "./connect";



export async function run(client: MyClient, ctx: CommandInteraction) {
    const query = ctx.options.getString("query");

    const player = await connect(client, ctx, false);

    if (!player)
        return;

    await ctx.deferReply();

    let embed = new MessageEmbed()
        .setColor(design.color as ColorResolvable)
        .setTitle("Now playing.")
        .setAuthor(`@${ctx.user.tag}`, ctx.user.avatarURL() as string);

    if (query) {
        const track = await player.addTrack(query, ctx.user);
        embed = new MessageEmbed()
            .setColor(design.color as ColorResolvable)
            .setTitle(track.title)
            .setDescription("Has been pushed to queue.")
            .setURL(track.url)
            .setThumbnail(track.thumbnail)
            .setAuthor(`@${ctx.user.tag}`, ctx.user.avatarURL() as string);

        console.log(`${track.title} added to ${ctx.guildId}`);
    }

    await ctx.editReply({ embeds: [embed] });

    if (!player.nowPlaying) {
        await player.play();
    }
}

const data = {
    name: "play",
    description: "Play a song or add it to queue.",
    options: [
        {
            name: "query",
            description: "Title or URL of the song.",
            type: "STRING",
            required: true
        }
    ]
}

export { data }