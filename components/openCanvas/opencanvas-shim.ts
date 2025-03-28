// This is an enhanced shim to provide OpenCanvas functionality
export class OpenCanvasShim {
  private element: HTMLElement;
  private content: string;
  private changeHandler: (content: string) => void;
  private isReadOnly: boolean;
  private editor: HTMLTextAreaElement | null = null;
  private preview: HTMLDivElement | null = null;
  private isPreviewMode: boolean = false;
  private toolbar: HTMLDivElement | null = null;
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private lastSavedContent: string = "";

  constructor(options: {
    element: HTMLElement;
    initialContent?: string;
    onChange?: (content: string) => void;
    readOnly?: boolean;
    theme?: string;
  }) {
    this.element = options.element;
    this.content = options.initialContent || "";
    this.lastSavedContent = this.content;
    this.changeHandler = options.onChange || (() => {});
    this.isReadOnly = options.readOnly || false;
    this.init();
    if (options.theme) {
      this.setTheme(options.theme);
    }
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
      position: "relative",
      borderRadius: "4px",
      overflow: "hidden",
    });

    // Create toolbar
    this.toolbar = document.createElement("div");
    this.toolbar.className = "opencanvas-toolbar";
    this.applyStyles(this.toolbar, {
      display: "flex",
      padding: "8px 12px",
      borderBottom: "1px solid #e2e8f0",
      backgroundColor: "#f8fafc",
      gap: "8px",
      alignItems: "center",
    });

    // Toggle preview button
    const previewBtn = document.createElement("button");
    previewBtn.innerHTML = "Preview";
    previewBtn.className = "opencanvas-btn";
    this.applyStyles(previewBtn, {
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      fontSize: "12px",
    });
    previewBtn.addEventListener("click", () => {
      this.setPreviewMode(!this.isPreviewMode);
    });

    // Undo button
    const undoBtn = document.createElement("button");
    undoBtn.innerHTML = "Undo";
    undoBtn.className = "opencanvas-btn";
    this.applyStyles(undoBtn, {
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      fontSize: "12px",
    });
    undoBtn.addEventListener("click", () => this.undo());

    // Redo button
    const redoBtn = document.createElement("button");
    redoBtn.innerHTML = "Redo";
    redoBtn.className = "opencanvas-btn";
    this.applyStyles(redoBtn, {
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      fontSize: "12px",
    });
    redoBtn.addEventListener("click", () => this.redo());

    // Add buttons to toolbar
    this.toolbar.appendChild(previewBtn);
    this.toolbar.appendChild(undoBtn);
    this.toolbar.appendChild(redoBtn);

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
      outline: "none",
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
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
      lineHeight: "1.6",
    });

    // Update preview content
    this.updatePreview();

    // Add event listener for textarea changes
    this.editor.addEventListener("input", () => {
      if (this.editor) {
        // Save to undo stack if content is different
        if (this.content !== this.editor.value) {
          this.undoStack.push(this.content);
          // Clear redo stack when new changes are made
          this.redoStack = [];
          if (this.undoStack.length > 50) {
            this.undoStack.shift(); // Limit undo history
          }
        }

        this.content = this.editor.value;
        this.updatePreview();
        this.changeHandler(this.content);
      }
    });

    // Key bindings
    this.editor.addEventListener("keydown", (e) => {
      // Ctrl+Z / Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        this.redo();
      }
      // Tab key handling for indentation
      if (e.key === "Tab") {
        e.preventDefault();
        this.insertIndentation();
      }
    });

    // Append elements to container
    container.appendChild(this.toolbar);
    container.appendChild(this.editor);
    container.appendChild(this.preview);

    // Append container to element
    this.element.appendChild(container);
  }

  private insertIndentation() {
    if (!this.editor) return;

    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;

    // Insert tab character or spaces
    const newText = "  "; // 2 spaces
    this.content =
      this.content.substring(0, start) + newText + this.content.substring(end);

    this.editor.value = this.content;

    // Move cursor position
    this.editor.selectionStart = this.editor.selectionEnd =
      start + newText.length;

    // Trigger change event
    this.updatePreview();
    this.changeHandler(this.content);
  }

  private undo() {
    if (this.undoStack.length === 0) return;

    // Save current state to redo stack
    this.redoStack.push(this.content);

    // Get previous state
    const previousContent = this.undoStack.pop()!;
    this.content = previousContent;

    if (this.editor) {
      this.editor.value = this.content;
    }

    this.updatePreview();
    this.changeHandler(this.content);
  }

  private redo() {
    if (this.redoStack.length === 0) return;

    // Save current state to undo stack
    this.undoStack.push(this.content);

    // Get next state
    const nextContent = this.redoStack.pop()!;
    this.content = nextContent;

    if (this.editor) {
      this.editor.value = this.content;
    }

    this.updatePreview();
    this.changeHandler(this.content);
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

    // Enhanced markdown parsing
    let html = this.content
      // Headers
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^#### (.*$)/gm, "<h4>$1</h4>")
      .replace(/^##### (.*$)/gm, "<h5>$1</h5>")

      // Bold
      .replace(/\*\*(.*?)\*\*/gm, "<strong>$1</strong>")

      // Italic
      .replace(/\*(.*?)\*/gm, "<em>$1</em>")
      .replace(/_(.*?)_/gm, "<em>$1</em>")

      // Code
      .replace(/`(.*?)`/gm, "<code>$1</code>")

      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/gm,
        '<a href="$2" target="_blank">$1</a>'
      )

      // Unordered Lists
      .replace(/^\s*[\-\*] (.*$)/gm, "<li>$1</li>")

      // Ordered Lists
      .replace(/^\s*\d+\. (.*$)/gm, "<li>$1</li>")

      // Blockquotes
      .replace(/^\> (.*$)/gm, "<blockquote>$1</blockquote>")

      // Horizontal Rules
      .replace(/^---$/gm, "<hr>")

      // Paragraphs
      .split("\n\n")
      .join("</p><p>");

    // Process lists
    html = html.replace(/<li>.*?<\/li>/gs, function (match) {
      return "<ul>" + match + "</ul>";
    });

    // Clean up any potential issues
    html = html.replace(/<\/ul><ul>/g, "").replace(/<p><\/p>/g, "");

    this.preview.innerHTML = `<div class="markdown-content"><p>${html}</p></div>`;

    // Add styles to the preview content
    this.stylizePreview();
  }

  private stylizePreview() {
    if (!this.preview) return;

    // Add CSS for preview content
    const elements = {
      "h1, h2, h3, h4, h5, h6": {
        marginTop: "1em",
        marginBottom: "0.5em",
        fontWeight: "bold",
        lineHeight: "1.2",
      },
      h1: { fontSize: "1.8em" },
      h2: { fontSize: "1.5em" },
      h3: { fontSize: "1.3em" },
      h4: { fontSize: "1.1em" },
      p: { margin: "0.5em 0" },
      "ul, ol": {
        paddingLeft: "2em",
        margin: "0.5em 0",
      },
      li: { margin: "0.3em 0" },
      code: {
        backgroundColor: "#f0f0f0",
        padding: "0.2em 0.4em",
        borderRadius: "3px",
        fontFamily: "monospace",
      },
      blockquote: {
        borderLeft: "3px solid #ccc",
        paddingLeft: "1em",
        fontStyle: "italic",
        margin: "0.5em 0",
      },
      a: {
        color: "#007bff",
        textDecoration: "none",
      },
      hr: {
        border: "none",
        borderTop: "1px solid #ccc",
        margin: "1em 0",
      },
    };

    // Apply styles to elements
    Object.keys(elements).forEach((selector) => {
      const els = this.preview!.querySelectorAll(selector);
      els.forEach((el) => {
        Object.assign(
          (el as HTMLElement).style,
          elements[selector as keyof typeof elements]
        );
      });
    });
  }

  // Public methods to match OpenCanvas API
  public setContent(content: string) {
    this.content = content;
    this.lastSavedContent = content;
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
    // Enhanced theme implementation
    if (this.editor && this.preview && this.toolbar) {
      if (theme === "dark") {
        this.applyStyles(this.toolbar, {
          backgroundColor: "#1e293b",
          borderColor: "#334155",
          color: "#f8fafc",
        });

        this.applyStyles(this.editor, {
          backgroundColor: "#111827",
          color: "#f9fafb",
          caretColor: "#f9fafb",
        });

        this.applyStyles(this.preview, {
          backgroundColor: "#111827",
          color: "#f9fafb",
        });

        // Style buttons
        const buttons = this.toolbar.querySelectorAll(".opencanvas-btn");
        buttons.forEach((btn) => {
          this.applyStyles(btn as HTMLElement, {
            backgroundColor: "#1e293b",
            borderColor: "#475569",
            color: "#f8fafc",
          });
        });
      } else {
        this.applyStyles(this.toolbar, {
          backgroundColor: "#f8fafc",
          borderColor: "#e2e8f0",
          color: "#0f172a",
        });

        this.applyStyles(this.editor, {
          backgroundColor: "#ffffff",
          color: "#0f172a",
          caretColor: "#0f172a",
        });

        this.applyStyles(this.preview, {
          backgroundColor: "#ffffff",
          color: "#0f172a",
        });

        // Style buttons
        const buttons = this.toolbar.querySelectorAll(".opencanvas-btn");
        buttons.forEach((btn) => {
          this.applyStyles(btn as HTMLElement, {
            backgroundColor: "#ffffff",
            borderColor: "#e2e8f0",
            color: "#0f172a",
          });
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

    // Save current state to undo stack before replacing
    this.undoStack.push(this.content);
    this.redoStack = [];

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
    if (this.toolbar) {
      this.toolbar.remove();
    }
  }

  // Additional methods to match OpenCanvas full API
  public hasUnsavedChanges() {
    return this.content !== this.lastSavedContent;
  }

  public saveContent() {
    this.lastSavedContent = this.content;
    return this.content;
  }

  public focus() {
    if (this.editor && !this.isPreviewMode) {
      this.editor.focus();
    }
  }

  public getElement() {
    return this.element;
  }
}
