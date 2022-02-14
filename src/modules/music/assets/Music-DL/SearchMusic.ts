import { ytdlArgs, ytdlResponse } from "./Types"
import { execFile } from "child_process"
import { promisify } from "util";
import { quetzaConfig } from "../../../../config";

const execFileAsync = promisify(execFile);

function argumentsResolver(args: ytdlArgs): string[] {
    const options = Object.entries(args);
    return options.map(([key, value]) => {
        if (typeof value === "boolean" && value) {
           return `--${key.split(/(?=[A-Z])/).join("-")}`.toLowerCase();
        }
        else {
           return `--${key.split(/(?=[A-Z])/).join("-")}=${value}`.toLowerCase();
        }
    });
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
    let response = await ytdlExec(query, args);

    if (response && !response.extractor.includes("youtube")) {
        response = await ytdlExec(`${response.title} - ${response.creator}`, args);
    }

    return response;
}