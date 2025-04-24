import { readFileSync } from "fs"

const thing = JSON.parse(readFileSync("humans_airdrop_qualification_combined.json"), 'utf8')

const result = thing.reduce((acc, e) => (
    {...acc, [e.count]: acc[e.count] ? acc[e.count]+1 : 1}
), {})

console.log(result)