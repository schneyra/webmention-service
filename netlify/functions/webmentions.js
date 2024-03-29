const fetch = require('node-fetch');

function renderWebmentionHtml(data) {
    let html = "";

    const webmentions = data.children;
    if (webmentions.length) {
        // now we're generating the actual list
        html += `<ol class="webmentions">`;

        webmentions.forEach((mention) => {
            const twitterString = mention.url.includes("twitter.com")
                ? " on twitter"
                : "";

            html += `<li class="webmentions__mention"><span class="webmentions__head">`;

            if (mention.author.photo) {
                html += `<img src="${mention.author.photo}" class="webmentions__avatar" loading="lazy" height="256" width="256" />`;
            }

            html += `<span>${
                mention.author.name
                    ? mention.author.name
                    : "<em>Someone</em>"
            } `;

            if (mention["wm-property"] === "like-of") {
                html += `liked <a href="${mention.url}">this post</a>${twitterString}.</span></span>`;
            }

            if (
                mention["wm-property"] === "in-reply-to" &&
                mention.content
            ) {
                html += `
                replied to <a href="${mention.url}">this post</a>${twitterString}.</span></span>
                <blockquote class="webmentions__quote">${mention.content.text}</blockquote>
            `;
            }

            if (mention["wm-property"] === "repost-of") {
                html += `reposted <a href="${mention.url}">this post</a>${twitterString}.</span></span>`;
            }

            if (mention["wm-property"] === "mention-of") {
                html += `mentioned the article in <a href="${mention.url}">this post</a>${twitterString}.</span></span>`;
            }

            html += `</li>`;
        });

        html += `</ol>`;
    } else {
        html += "<p>No mentions yet. Be the first to share this post!</p>";
    }

    return html;
}

exports.handler = async (event, context) => {
    return fetch(`https://webmention.io/api/mentions.jf2?domain=martinschneider.me&per-page=200&sort-dir=up&target=${event.queryStringParameters.url}`)
      .then((response) => response.json())
      .then((data) => ({
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        body: `${renderWebmentionHtml(data)}`,
        //body: JSON.stringify(data)
      }))
      .catch((error) => ({ statusCode: 422, body: String(error) }));
  };
