// The project currently uses a root App Router. The implementation lives at the
// requested src/app path; this adapter makes that handler reachable without
// maintaining a second copy of the server logic.
export { POST } from "@/src/app/api/generate-trial/route";
