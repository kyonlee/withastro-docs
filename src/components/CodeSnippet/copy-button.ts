import type { InlineToken } from "./types";

export class CopyButton {
	private codeLines: string[] = []

	private tokens: InlineToken[];
	private textLine: string;

	private beforeClassValue: string;
	private classes: Set<string>;
	private afterClassValue: string;
	private afterTokens: string;

	constructor(codeHtmlLines: string[]) {
		this.codeLines = codeHtmlLines;
	}

	stripHtml() {
		const toStrip = this.codeLines[0];

		const lineRegExp = /^(<span class=")(line.*?)(".*?>)(.*)(<\/span>)$/;
		const lineMatches = toStrip.match(lineRegExp);
		if (!lineMatches)
			throw new Error(
				`Shiki-highlighted code line HTML did not match expected format. HTML code:\n${toStrip}`
			);

		this.beforeClassValue = lineMatches[1];
		this.classes = new Set(lineMatches[2].split(' '));
		this.afterClassValue = lineMatches[3];
		const tokensHtml = lineMatches[4];
		this.afterTokens = lineMatches[5];

		// Split line into inline tokens
		const tokenRegExp = /<span style="color: ?(#[0-9A-Fa-f]+)([^"]*)">(.*?)<\/span>/g;
		const tokenMatches = tokensHtml.matchAll(tokenRegExp);
		this.tokens = [];
		this.textLine = '';
		for (const tokenMatch of tokenMatches) {
			const [, color, otherStyles, innerHtml] = tokenMatch;
			const text = unescape(innerHtml);
			this.tokens.push({
				tokenType: 'syntax',
				color,
				otherStyles,
				innerHtml,
				text,
				textStart: this.textLine.length,
				textEnd: this.textLine.length + text.length,
			});
			this.textLine += text;
		}

		return this.textLine.replaceAll('&#39;', '\'');
	}

	renderToHtml() {
		return `<button class="copy-button" value="${encodeURIComponent(this.stripHtml())}">copy</button>`;
	}
}
