function isUrl(url) {
  // Regex from https://stackoverflow.com/a/3809435
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(
    url
  );
}

(async function redirect() {
  const location = window.location;
  const issueNumber = location.pathname.split("/")[PATH_SEGMENTS_TO_SKIP + 1];

  const homepage =
    location.protocol +
    "//" +
    location.hostname +
    (location.port ? ":" + location.port : "") +
    "/" +
    location.pathname.split("/")[PATH_SEGMENTS_TO_SKIP];

  try {
    const response = await fetch(GITHUB_ISSUES_LINK + issueNumber);

    if (!response.ok) {
      throw new Error('issueNumber does not exist in gh issues or other error');
    }

    const payload = await response.json();
    let { message, title } = payload;

    if ((message !== "Not Found") && (title || isUrl(title))) {
      // Check if the title of issue is a legitimate URL
      const url = new URL(title);

      if (
        (url.protocol !== "https:" && url.protocol !== "http:") ||
        url.host === HOST
      ) {
        // Prevent recursive redirects and XSS
        throw new Error('XSS');
      } else {
        location.replace(title);
      }
    }
    throw new Error('issueNumber does not exist in gh issues');
  } catch (e) {
    location.replace(homepage);
  }
})();
