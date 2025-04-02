"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  ListChecks,
  BookOpen,
  Target,
  Lightbulb,
} from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  isDarkMode: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isDarkMode,
}) => {
  // Parse the markdown content into a hierarchical structure
  const parsedContent = parseMarkdown(content);

  return (
    <div
      className={`w-full overflow-hidden ${
        isDarkMode ? "text-gray-100" : "text-gray-800"
      }`}
    >
      {parsedContent.map((block, blockIndex) => (
        <RenderBlock
          key={blockIndex}
          block={block}
          blockIndex={blockIndex}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
};

// Types for our parsed content
type ContentBlock = {
  type: "paragraph" | "heading" | "numbered-list" | "bulleted-list";
  content?: string;
  level?: number;
  items?: ListItem[];
};

type ListItem = {
  content: string;
  children?: ListItem[];
  isBold?: boolean;
};

// Render a single content block with proper animations
const RenderBlock: React.FC<{
  block: ContentBlock;
  blockIndex: number;
  isDarkMode: boolean;
}> = ({ block, blockIndex, isDarkMode }) => {
  // Animation settings
  const blockAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: blockIndex * 0.1 },
  };

  if (block.type === "paragraph") {
    return (
      <motion.p {...blockAnimation} className="mb-4 leading-relaxed">
        <FormattedText text={block.content || ""} isDarkMode={isDarkMode} />
      </motion.p>
    );
  }

  if (block.type === "heading") {
    return (
      <motion.h3
        {...blockAnimation}
        className={`text-lg font-semibold mb-3 ${
          isDarkMode ? "text-blue-300" : "text-blue-600"
        }`}
      >
        <FormattedText text={block.content || ""} isDarkMode={isDarkMode} />
      </motion.h3>
    );
  }

  if (block.type === "numbered-list") {
    return (
      <motion.div {...blockAnimation} className="mb-4">
        <ol className="space-y-4 pl-1">
          {block.items?.map((item, itemIndex) => (
            <RenderNumberedListItem
              key={itemIndex}
              item={item}
              itemIndex={itemIndex}
              blockIndex={blockIndex}
              isDarkMode={isDarkMode}
            />
          ))}
        </ol>
      </motion.div>
    );
  }

  if (block.type === "bulleted-list") {
    return (
      <motion.div {...blockAnimation} className="mb-4">
        <ul className="space-y-2 pl-1">
          {block.items?.map((item, itemIndex) => (
            <RenderBulletedListItem
              key={itemIndex}
              item={item}
              itemIndex={itemIndex}
              blockIndex={blockIndex}
              isDarkMode={isDarkMode}
            />
          ))}
        </ul>
      </motion.div>
    );
  }

  return null;
};

// Render a numbered list item with any nested items
const RenderNumberedListItem: React.FC<{
  item: ListItem;
  itemIndex: number;
  blockIndex: number;
  isDarkMode: boolean;
}> = ({ item, itemIndex, blockIndex, isDarkMode }) => {
  const animationDelay = itemIndex * 0.05 + blockIndex * 0.1;

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: animationDelay }}
      className="flex items-start"
    >
      <span
        className={`mr-2 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs ${
          isDarkMode ? "bg-blue-800 text-blue-200" : "bg-blue-100 text-blue-600"
        }`}
      >
        {itemIndex + 1}
      </span>

      <div className="flex-grow">
        <div
          className={
            item.isBold
              ? `font-medium ${isDarkMode ? "text-blue-200" : "text-blue-600"}`
              : ""
          }
        >
          <FormattedText text={item.content} isDarkMode={isDarkMode} />
        </div>

        {item.children && item.children.length > 0 && (
          <ul className="mt-2 space-y-1 pl-4">
            {item.children.map((child, childIndex) => (
              <RenderNestedListItem
                key={childIndex}
                item={child}
                itemIndex={childIndex}
                parentIndex={itemIndex}
                blockIndex={blockIndex}
                nesting={1}
                isDarkMode={isDarkMode}
              />
            ))}
          </ul>
        )}
      </div>
    </motion.li>
  );
};

// Render a bulleted list item with any nested items
const RenderBulletedListItem: React.FC<{
  item: ListItem;
  itemIndex: number;
  blockIndex: number;
  isDarkMode: boolean;
}> = ({ item, itemIndex, blockIndex, isDarkMode }) => {
  const animationDelay = itemIndex * 0.05 + blockIndex * 0.1;

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: animationDelay }}
      className="flex items-start"
    >
      <span
        className={`mr-2 mt-1 flex-shrink-0 ${
          isDarkMode ? "text-blue-300" : "text-blue-500"
        }`}
      >
        <GetBulletIcon item={item} index={itemIndex} />
      </span>

      <div className="flex-grow">
        <div className={item.isBold ? "font-medium" : ""}>
          <FormattedText text={item.content} isDarkMode={isDarkMode} />
        </div>

        {item.children && item.children.length > 0 && (
          <ul className="mt-2 space-y-1 pl-4">
            {item.children.map((child, childIndex) => (
              <RenderNestedListItem
                key={childIndex}
                item={child}
                itemIndex={childIndex}
                parentIndex={itemIndex}
                blockIndex={blockIndex}
                nesting={1}
                isDarkMode={isDarkMode}
              />
            ))}
          </ul>
        )}
      </div>
    </motion.li>
  );
};

// Render a nested list item (could be multiple levels deep)
const RenderNestedListItem: React.FC<{
  item: ListItem;
  itemIndex: number;
  parentIndex: number;
  blockIndex: number;
  nesting: number;
  isDarkMode: boolean;
}> = ({ item, itemIndex, parentIndex, blockIndex, nesting, isDarkMode }) => {
  const animationDelay =
    parentIndex * 0.05 + itemIndex * 0.03 + blockIndex * 0.1 + nesting * 0.1;

  return (
    <motion.li
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: animationDelay }}
      className="flex items-start"
    >
      <span
        className={`mr-2 text-xs ${
          isDarkMode ? "text-blue-300" : "text-blue-500"
        }`}
      >
        {nesting === 1 ? "•" : "-"}
      </span>

      <div className="flex-grow">
        <div className={item.isBold ? "font-medium" : ""}>
          <FormattedText text={item.content} isDarkMode={isDarkMode} />
        </div>

        {item.children && item.children.length > 0 && (
          <ul className="mt-1 space-y-1 pl-4">
            {item.children.map((child, childIndex) => (
              <RenderNestedListItem
                key={childIndex}
                item={child}
                itemIndex={childIndex}
                parentIndex={itemIndex}
                blockIndex={blockIndex}
                nesting={nesting + 1}
                isDarkMode={isDarkMode}
              />
            ))}
          </ul>
        )}
      </div>
    </motion.li>
  );
};

// Helper to pick an appropriate icon for a list item
const GetBulletIcon: React.FC<{ item: ListItem; index: number }> = ({
  item,
  index,
}) => {
  const content = item.content.toLowerCase();

  if (content.includes("skill")) return <ListChecks size={16} />;
  if (content.includes("experience")) return <BookOpen size={16} />;
  if (content.includes("qualification")) return <Target size={16} />;
  if (content.includes("gap") || content.includes("growth"))
    return <Lightbulb size={16} />;
  if (content.includes("tailor")) return <ArrowRight size={16} />;

  return <Check size={16} />;
};

// Format text with bold sections
const FormattedText: React.FC<{ text: string; isDarkMode: boolean }> = ({
  text,
  isDarkMode,
}) => {
  // Split by bold markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          // Bold text
          const boldText = part.substring(2, part.length - 2);
          return <strong key={index}>{boldText}</strong>;
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

// Main parsing function
function parseMarkdown(markdown: string): ContentBlock[] {
  const lines = markdown.split("\n");
  const blocks: ContentBlock[] = [];

  let currentBlock: ContentBlock | null = null;
  let currentListItem: ListItem | null = null;
  let listStack: ListItem[][] = [];
  let indentationStack: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    const line = originalLine.trim();
    const indentation = getIndentation(originalLine);

    // Skip empty lines
    if (!line) {
      if (currentBlock && currentBlock.type === "paragraph") {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // Handle headings
    if (line.startsWith("#")) {
      if (currentBlock) blocks.push(currentBlock);

      const level = line.match(/^#+/)?.[0].length || 1;
      currentBlock = {
        type: "heading",
        content: line.replace(/^#+\s+/, ""),
        level,
      };
      blocks.push(currentBlock);
      currentBlock = null;
      continue;
    }

    // Handle numbered lists (e.g., "1. List item")
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      if (currentBlock && currentBlock.type !== "numbered-list") {
        blocks.push(currentBlock);
        currentBlock = null;
      }

      if (!currentBlock) {
        currentBlock = {
          type: "numbered-list",
          items: [],
        };
      }

      // Check if this item has a bold title
      const content = numberedMatch[2];
      const boldTitleMatch = content.match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);

      if (boldTitleMatch) {
        // Split into title and content
        currentListItem = {
          content: `**${boldTitleMatch[1]}**${
            boldTitleMatch[2] ? `: ${boldTitleMatch[2]}` : ""
          }`,
          isBold: true,
          children: [],
        };
      } else {
        currentListItem = {
          content,
          children: [],
        };
      }

      // Reset nesting level for new top-level item
      listStack = [[currentListItem]];
      indentationStack = [indentation];

      currentBlock.items?.push(currentListItem);
      continue;
    }

    // Handle bulleted lists
    if (
      line.startsWith("-") ||
      (line.startsWith("*") && !line.startsWith("**"))
    ) {
      const content = line.substring(1).trim();

      // Determine the correct list block type
      const listType =
        currentBlock?.type === "numbered-list"
          ? "numbered-list"
          : "bulleted-list";

      if (currentBlock && currentBlock.type !== listType) {
        blocks.push(currentBlock);
        currentBlock = null;
      }

      if (!currentBlock) {
        currentBlock = {
          type: "bulleted-list",
          items: [],
        };
      }

      // Check indentation to determine nesting level
      let nestingLevel = 0;
      for (let j = indentationStack.length - 1; j >= 0; j--) {
        if (indentation > indentationStack[j]) {
          nestingLevel = j + 1;
          break;
        }
      }

      // Create the new list item
      const newItem: ListItem = {
        content,
        children: [],
      };

      // Update indentation and list stacks
      if (nestingLevel >= listStack.length) {
        // Add as a child to the previous item
        const parentList = listStack[listStack.length - 1];
        const parentItem = parentList[parentList.length - 1];

        if (!parentItem.children) parentItem.children = [];
        parentItem.children.push(newItem);

        // Add a new level to the stack
        listStack.push([newItem]);
        indentationStack.push(indentation);
      } else {
        // Adjust stacks for the current nesting level
        listStack = listStack.slice(0, nestingLevel + 1);
        indentationStack = indentationStack.slice(0, nestingLevel + 1);

        // Add to the appropriate parent
        if (nestingLevel === 0) {
          // Top level in the current list
          currentBlock.items?.push(newItem);
          listStack = [[newItem]];
          indentationStack = [indentation];
        } else {
          // Add to parent at current nesting level
          const parentList = listStack[nestingLevel - 1];
          const parentItem = parentList[parentList.length - 1];

          if (!parentItem.children) parentItem.children = [];
          parentItem.children.push(newItem);

          // Update the current level in the stack
          listStack[nestingLevel] = [newItem];
          indentationStack[nestingLevel] = indentation;
        }
      }

      continue;
    }

    // Regular paragraph
    if (!currentBlock || currentBlock.type !== "paragraph") {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { type: "paragraph", content: line };
    } else {
      // Append to existing paragraph
      currentBlock.content += " " + line;
    }
  }

  // Add the final block if there is one
  if (currentBlock) blocks.push(currentBlock);

  return blocks;
}

// Helper function to calculate indentation level
function getIndentation(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}
