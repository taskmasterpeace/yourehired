// This is a minimal shim to provide OpenCanvas-like functionality if the real library fails to load
export class OpenCanvasShim {
  private element: HTMLElement;
  private content: string;
  private changeHandler: (content: string) => void;
  private memoryHandler?: (memory: string) => void;
  private isReadOnly: boolean;
  private editor: HTMLTextAreaElement | null = null;
  private preview: HTMLDivElement | null = null;
  private isPreviewMode: boolean = false;

  constructor(options: {
    element: HTMLElement;
    initialContent?: string;
    onChange?: (content: string) => void;
    onMemory?: (memory: string) => void;
    readOnly?: boolean;
  }) {
    this.element = options.element;
    this.content = options.initialContent || "";
    this.changeHandler = options.onChange || (() => {});
    this.memoryHandler = options.onMemory;
    this.isReadOnly = options.readOnly || false;

    this.init();
  }

  private init() {
    // Clear the container
    this.element.innerHTML = "";

    // Create editor container
    const container = document.createElement("div");
    container.className = "opencanvas-shim";
    this.applyStyles(container, {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
    });

    // Create textarea for editing
    this.editor = document.createElement("textarea");
    this.editor.value = this.content;
    this.applyStyles(this.editor, {
      width: "100%",
      flexGrow: "1",
      padding: "1rem",
      border: "none",
      resize: "none",
      fontFamily: "monospace",
      fontSize: "14px",
      lineHeight: "1.5",
      minHeight: "300px",
    });
    this.editor.readOnly = this.isReadOnly;

    // Create preview div
    this.preview = document.createElement("div");
    this.preview.className = "markdown-preview";
    this.applyStyles(this.preview, {
      width: "100%",
      flexGrow: "1",
      padding: "1rem",
      overflow: "auto",
      display: "none",
    });

    // Update preview content
    this.updatePreview();

    // Add event listener for textarea changes
    this.editor.addEventListener("input", () => {
      if (this.editor) {
        this.content = this.editor.value;
        this.updatePreview();
        this.changeHandler(this.content);
      }
    });

    // Append elements to container
    container.appendChild(this.editor);
    container.appendChild(this.preview);

    // Append container to element
    this.element.appendChild(container);
  }

  // Helper method to apply multiple styles safely
  private applyStyles(element: HTMLElement, styles: Record<string, string>) {
    Object.keys(styles).forEach((property) => {
      // Use type assertion to avoid TypeScript errors
      (element.style as any)[property] = styles[property];
    });
  }

  private updatePreview() {
    if (!this.preview) return;

    // Simple markdown parsing (very basic)
    let html = this.content
      // Headers
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      // Bold
      .replace(/\*\*(.*)\*\*/gm, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*)\*/gm, "<em>$1</em>")
      // Lists
      .replace(/^\s*\* (.*$)/gm, "<li>$1</li>")
      // Paragraphs
      .split("\n\n")
      .join("</p><p>");

    this.preview.innerHTML = `<p>${html}</p>`;
  }

  // Public methods to match OpenCanvas API

  public setContent(content: string) {
    this.content = content;
    if (this.editor) {
      this.editor.value = content;
    }
    this.updatePreview();
  }

  public getContent() {
    return this.content;
  }

  public setPreviewMode(isPreview: boolean) {
    this.isPreviewMode = isPreview;

    if (this.editor && this.preview) {
      if (isPreview) {
        this.applyStyles(this.editor, { display: "none" });
        this.applyStyles(this.preview, { display: "block" });
      } else {
        this.applyStyles(this.editor, { display: "block" });
        this.applyStyles(this.preview, { display: "none" });
      }
    }
  }

  public setReadOnly(readOnly: boolean) {
    this.isReadOnly = readOnly;
    if (this.editor) {
      this.editor.readOnly = readOnly;
    }
  }

  public setTheme(theme: string) {
    // Simple theme implementation
    if (this.editor && this.preview) {
      if (theme === "dark") {
        this.applyStyles(this.editor, {
          backgroundColor: "#1e1e1e",
          color: "#f5f5f5",
        });
        this.applyStyles(this.preview, {
          backgroundColor: "#1e1e1e",
          color: "#f5f5f5",
        });
      } else {
        this.applyStyles(this.editor, {
          backgroundColor: "#ffffff",
          color: "#333333",
        });
        this.applyStyles(this.preview, {
          backgroundColor: "#ffffff",
          color: "#333333",
        });
      }
    }
  }

  public getSelectedText() {
    if (!this.editor) return "";

    return this.editor.value.substring(
      this.editor.selectionStart,
      this.editor.selectionEnd
    );
  }

  public replaceSelectedText(newText: string) {
    if (!this.editor) return;

    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;

    this.content =
      this.content.substring(0, start) + newText + this.content.substring(end);

    this.editor.value = this.content;
    this.updatePreview();
    this.changeHandler(this.content);

    // Set cursor position after the inserted text
    this.editor.selectionStart = start + newText.length;
    this.editor.selectionEnd = start + newText.length;
    this.editor.focus();
  }

  public destroy() {
    if (this.editor) {
      this.editor.remove();
    }
    if (this.preview) {
      this.preview.remove();
    }
  }
}
