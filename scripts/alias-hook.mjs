import { register } from "node:module";
import { pathToFileURL } from "node:url";

/**
 * `npm test` 에서 "@/..." 경로와 확장자 없는 import 를 읽을 수 있게 하는 훅.
 * (Next.js 없이 node --test 로 lib 함수를 그대로 돌리기 위한 것)
 */
register("./alias-resolve.mjs", pathToFileURL(import.meta.filename));
