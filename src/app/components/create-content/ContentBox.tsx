"use client";
import { Tab, Tabs } from "@nextui-org/react";
import Editor from "./Editor";
import Preview from "./Preview";
import { useState } from "react";
import CreateActions from "./CreateActions";

export default function ContentBox() {
  const [content, setContent] = useState<string>("");
  const tabs = [
    {
      id: "editor",
      label: "Editor",
      content: <Editor content={content} setContent={setContent} />,
    },
    {
      id: "preview",
      label: "Perview",
      content: <Preview content={content} />,
    },
  ];
  return (
    <div className="flex flex-col w-full items-start px-4 xs:px-8 sm:px-12 md:px-18 lg:px-24 xl:px-36 h-full">
      <Tabs aria-label="Dynamic tabs" size="lg" color="primary" items={tabs}>
        {(item) => (
          <Tab key={item.id} className="w-full h-fit" title={item.label}>
            {item.content}
          </Tab>
        )}
      </Tabs>
      <CreateActions content={content} setContent={setContent} />
    </div>
  );
}
