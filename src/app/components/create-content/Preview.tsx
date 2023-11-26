import { Code } from "@nextui-org/react";

export default function Preview({ content }: { content: string }) {
  return (
    <Code className="whitespace-pre w-full">
      {content === "" ? "No content entered" : content}
    </Code>
  );
}
