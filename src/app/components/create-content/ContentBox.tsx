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
    <div className="xs:px-8 md:px-18 flex h-full w-full flex-col items-start px-4 sm:px-12 lg:px-24 xl:px-36">
      <Tabs aria-label="Dynamic tabs" size="lg" color="primary" items={tabs}>
        {(item) => (
          <Tab key={item.id} className="h-fit w-full" title={item.label}>
            {item.content}
          </Tab>
        )}
      </Tabs>
      <CreateActions content={content} setContent={setContent} />
    </div>
  );
}
