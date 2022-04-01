import { HttpsProxyAgent } from "hpagent";
import { readFileSync } from "fs";

const url = "proxy.zyte.com:8011";
export const zyteAgent = new HttpsProxyAgent({
  proxy: `http://${process.env.ZYTE_KEY}:@${url}`,
  ca: readFileSync("./src/zyte-client/zyte-proxy-ca.crt"),
});
