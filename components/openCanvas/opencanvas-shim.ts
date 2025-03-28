// This is an enhanced shim to provide OpenCanvas functionality
export class OpenCanvasShim {
  private element: HTMLElement;
  content: string; // Changed to public for direct access in emergency cases
  private changeHandler: (content: string) => void;
  private isReadOnly: boolean;
  editor: HTMLTextAreaElement | null = null; // Changed to public for direct access
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
      backgroundColor: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    });

    // Update preview content
    this.updatePreviewInternal();

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
        this.updatePreviewInternal();
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
    this.updatePreviewInternal();
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
    this.updatePreviewInternal();
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
    this.updatePreviewInternal();
    this.changeHandler(this.content);
  }

  // Helper method to apply multiple styles safely
  private applyStyles(element: HTMLElement, styles: Record<string, string>) {
    Object.keys(styles).forEach((property) => {
      // Use type assertion to avoid TypeScript errors
      (element.style as any)[property] = styles[property];
    });
  }

  // Make this public so it can be explicitly called
  public updatePreview() {
    this.updatePreviewInternal();
  }

  private updatePreviewInternal() {
    if (!this.preview) return;

    // Detect if content appears to be a resume
    const isResumeFormat = this.detectResumeFormat(this.content);

    if (isResumeFormat) {
      this.renderResumePreview();
      return;
    }

    // Enhanced markdown parsing for non-resume content
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

  // Detect if the content appears to be a resume
  private detectResumeFormat(content: string): boolean {
    // Look for common resume sections
    const resumePatterns = [
      /education/i,
      /experience/i,
      /skills/i,
      /work\s+experience/i,
      /professional\s+experience/i,
      /employment\s+history/i,
      /certification/i,
      /objective/i,
      /summary/i,
      /contact\s+information/i,
    ];

    // Check if at least 3 resume patterns are found
    let matchCount = 0;
    for (const pattern of resumePatterns) {
      if (pattern.test(content)) {
        matchCount++;
        if (matchCount >= 3) {
          return true;
        }
      }
    }

    return false;
  }

  // Render a more resume-like preview
  private renderResumePreview() {
    if (!this.preview) return;

    // Split content into lines
    const lines = this.content.split("\n");
    let html = "";
    let inSection = false;
    let currentSection = "";

    // Parse resume sections
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) {
        if (inSection) {
          html += "<br>";
        }
        continue;
      }

      // Check if this is a section header
      const isSectionHeader =
        /^[A-Z][A-Z\s]+$/.test(line) ||
        /^[A-Z][a-zA-Z\s]+:$/.test(line) ||
        /^#+\s+[A-Z]/.test(line);

      if (isSectionHeader) {
        // Close previous section if any
        if (inSection) {
          html += "</div>";
        }

        // Start new section
        currentSection = line.replace(/^#+\s+/, "").replace(/:$/, "");
        html += `<div class="resume-section">
                  <h2 class="resume-section-header">${currentSection}</h2>`;
        inSection = true;
      } else if (line.startsWith("*") || line.startsWith("-")) {
        // Bullet points
        html += `<div class="resume-bullet">• ${line
          .substring(1)
          .trim()}</div>`;
      } else if (
        /^\d{4}\s*-\s*(\d{4}|Present)/.test(line) ||
        /^\d{1,2}\/\d{4}\s*-\s*(\d{1,2}\/\d{4}|Present)/.test(line)
      ) {
        // Date range - likely a job or education entry
        html += `<div class="resume-date-range">${line}</div>`;
      } else if (
        /^[A-Z][a-zA-Z\s]+(Inc\.|LLC|Ltd\.|Corporation|Company)/.test(line) ||
        /^[A-Z][a-zA-Z\s]+University|College|School/.test(line)
      ) {
        // Company or school name
        html += `<div class="resume-org-name">${line}</div>`;
      } else if (i === 0 || (i === 1 && !lines[0].trim())) {
        // First non-empty line is likely the name
        html += `<div class="resume-name">${line}</div>`;
      } else if (
        /@|http|\(\d{3}\)|\d{3}[-.]\d{3}[-.]\d{4}/.test(line) &&
        i < 5
      ) {
        // Contact info near the top
        html += `<div class="resume-contact">${line}</div>`;
      } else {
        // Regular content
        html += `<div class="resume-content">${line}</div>`;
      }
    }

    // Close final section if any
    if (inSection) {
      html += "</div>";
    }

    // Wrap in a resume container
    this.preview.innerHTML = `<div class="resume-preview-container">${html}</div>`;

    // Apply resume-specific styles
    this.stylizeResumePreview();
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

  // Apply resume-specific styles
  private stylizeResumePreview() {
    if (!this.preview) return;

    // Add a professional looking style to the resume
    const css = document.createElement("style");
    css.textContent = `
      .resume-preview-container {
        font-family: 'Arial', sans-serif;
        line-height: 1.4;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px 15px;
        background-color: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        border-radius: 4px;
      }
      
      .resume-name {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #2a3f5f;
        text-align: center;
        letter-spacing: 0.5px;
      }
      
      .resume-contact {
        font-size: 14px;
        text-align: center;
        margin-bottom: 20px;
        color: #555;
      }
      
      .resume-section {
        margin-bottom: 20      .resume-section {
        margin-bottom: 20px;
        padding-bottom: 10px;
      }
      
      .resume-section-header {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #2a3f5f;
        padding-bottom: 5px;
        border-bottom: 1px solid #eee;
      }
      
      .resume-date-range {
        font-weight: bold;
        color: #555;
        margin-top: 10px;
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      .resume-org-name {
        font-weight: bold;
        margin-bottom: 5px;
        font-size: 16px;
      }
      
      .resume-bullet {
        padding-left: 15px;
        position: relative;
        margin-bottom: 5px;
        line-height: 1.5;
      }
      
      .resume-content {
        margin-bottom: 5px;
        line-height: 1.5;
      }
    `;

    // Add the styles to the preview
    if (this.preview.querySelector("style")) {
      this.preview.querySelector("style")!.remove();
    }
    this.preview.appendChild(css);

    // Add animation
    const sections = this.preview.querySelectorAll(".resume-section");
    sections.forEach((section, index) => {
      (section as HTMLElement).style.opacity = "0";
      (section as HTMLElement).style.transform = "translateY(10px)";
      (section as HTMLElement).style.transition =
        "opacity 0.3s ease, transform 0.3s ease";
      (section as HTMLElement).style.transitionDelay = `${index * 0.1}s`;

      // Trigger animation
      setTimeout(() => {
        (section as HTMLElement).style.opacity = "1";
        (section as HTMLElement).style.transform = "translateY(0)";
      }, 10);
    });
  }

  // Public methods to match OpenCanvas API
  public setContent(content: string) {
    console.log("setContent called with length:", content.length);

    // Safety check for empty content
    if (!content) {
      console.warn("Empty content provided to setContent, using empty string");
      content = "";
    }

    // Store the new content
    this.content = content;
    this.lastSavedContent = content;

    // Update editor value in a more reliable way
    if (this.editor) {
      try {
        // Set value and ensure cursor is at the start
        this.editor.value = content;
        this.editor.selectionStart = 0;
        this.editor.selectionEnd = 0;

        // Force a blur/focus cycle to ensure the browser registers the change
        this.editor.blur();
        this.editor.focus();

        // Create synthetic input event to trigger all handlers
        const event = new Event("input", { bubbles: true });
        this.editor.dispatchEvent(event);
      } catch (e) {
        console.error("Error updating editor value:", e);
      }
    }

    // Force update the preview
    this.updatePreviewInternal();

    // Notify parent component
    this.changeHandler(content);

    // Force a repaint by briefly changing a style property
    if (this.editor) {
      const originalBg = this.editor.style.backgroundColor;
      this.editor.style.backgroundColor = "rgba(0,0,0,0.001)";
      setTimeout(() => {
        if (this.editor) {
          this.editor.style.backgroundColor = originalBg;

          // Double-check that the value was set correctly
          if (this.editor.value !== content) {
            console.warn(
              "Editor value doesn't match after setting! Retrying..."
            );
            this.editor.value = content;

            // Try again with the input event
            const event = new Event("input", { bubbles: true });
            this.editor.dispatchEvent(event);
          }
        }
      }, 10);
    }
  }

  public getContent() {
    // Ensure we return the most up-to-date content
    return this.editor?.value || this.content;
  }

  public setPreviewMode(isPreview: boolean) {
    this.isPreviewMode = isPreview;
    if (this.editor && this.preview) {
      if (isPreview) {
        this.applyStyles(this.editor, { display: "none" });
        this.applyStyles(this.preview, { display: "block" });
        this.updatePreviewInternal(); // Refresh preview when switching to preview mode
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

        // Update resume preview styles for dark mode
        if (this.isPreviewMode) {
          const css = this.preview.querySelector("style");
          if (css) {
            css.textContent = css.textContent
              .replace(/background-color: white;/, "background-color: #1e293b;")
              .replace(/color: #333;/g, "color: #f8fafc;")
              .replace(/color: #2a3f5f;/g, "color: #93c5fd;")
              .replace(/color: #555;/g, "color: #cbd5e1;")
              .replace(
                /border-bottom: 1px solid #eee;/,
                "border-bottom: 1px solid #475569;"
              );
          }
        }

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

        // Update resume preview styles for light mode
        if (this.isPreviewMode) {
          this.updatePreviewInternal(); // Refresh preview to get light mode styles
        }

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

    console.log("replaceSelectedText called with length:", newText.length);

    // Final validation check for newText
    if (!newText) {
      console.warn("Empty text provided to replaceSelectedText, ignoring");
      return;
    }

    // Save current state to undo stack before replacing
    this.undoStack.push(this.content);
    this.redoStack = [];

    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;

    // Create the new content
    const newContent =
      this.content.substring(0, start) + newText + this.content.substring(end);

    // Update both the content property and the editor value
    this.content = newContent;
    this.editor.value = newContent;

    // Create a synthetic input event to trigger all necessary handlers
    const event = new Event("input", { bubbles: true });
    this.editor.dispatchEvent(event);

    // Update the preview
    this.updatePreviewInternal();

    // Notify parent component explicitly
    this.changeHandler(newContent);

    // Set cursor position after the inserted text
    this.editor.selectionStart = start + newText.length;
    this.editor.selectionEnd = start + newText.length;

    // Focus the editor
    this.editor.focus();

    // Double-check content update
    setTimeout(() => {
      if (this.editor && this.editor.value !== newContent) {
        console.warn("Content mismatch after replace, forcing update");
        this.editor.value = newContent;
        this.content = newContent;

        // Try input event again
        const event = new Event("input", { bubbles: true });
        this.editor.dispatchEvent(event);

        // Make sure parent is notified
        this.changeHandler(newContent);
      }
    }, 50);
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
