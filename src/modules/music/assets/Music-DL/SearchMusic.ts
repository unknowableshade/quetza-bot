import { ytdlArgs, ytdlResponse } from "./Types"
import { execFile } from "child_process"
import { promisify } from "util";
import { getTracks, getPreview } from "spotify-url-info";
import { quetzaConfig } from "../../../../config";

const execFileAsync = promisify(execFile);

function argumentsResolver(args: ytdlArgs): string[] {
    let response: string[] = [];
    const options = Object.entries(args);
    options.forEach(([key, value]) => {
        if (typeof value == "boolean" && value == true) {
            response.push(`--${key.split(/(?=[A-Z])/).join("-").toLowerCase()}`);
        }
        else {
            response.push(`--${key.split(/(?=[A-Z])/).join("-")}=${value}`.toLowerCase())
        }
    });
    return response;
}

async function ytdlExec(query: string, args: ytdlArgs): Promise<ytdlResponse | undefined> { 
    try {
        const executable = await execFileAsync(quetzaConfig.rootDir + "../bin/youtube-dl", [`${query}`].concat(argumentsResolver(args)));
        return JSON.parse(executable.stdout);
    }
    catch (error) {
        console.log(error);
        return undefined;
    }
}

export async function searchMusic(query: string, args: ytdlArgs): Promise<ytdlResponse | undefined> {
    try {
        const spotify = {
            preview: await getPreview(query), 
            tracks: await getTracks(query)
        };

        if ((spotify.preview.type === "track" || spotify.preview.type === "playlist") && spotify.tracks.length !== 0) {
            return ytdlExec(`${spotify.tracks[0].name} - ${spotify.tracks[0].artists ? spotify.tracks[0].artists[0].name : ""}`, args);
        }
        else if (spotify.preview.type === "album" && spotify.tracks.length !== 0) {
            return ytdlExec(`${spotify.preview.title} full album`, args);
        }

        return undefined;
    }
    catch {
        const response = await ytdlExec(query, args);
        if (!response) 
            return undefined;

        if (!response.extractor.includes("youtube")) {
            return await ytdlExec(`${response.title} - ${response.creator}`, args);
        }
        return response;
    }
}