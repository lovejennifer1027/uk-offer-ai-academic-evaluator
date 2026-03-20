import path from "path";

export function getLocalDataDir() {
  if (process.env.SCHOLARDESK_LOCAL_DATA_DIR) {
    return process.env.SCHOLARDESK_LOCAL_DATA_DIR;
  }

  if (process.env.VERCEL) {
    return path.join("/tmp", "scholardesk");
  }

  return path.join(process.cwd(), ".local", "scholardesk");
}
