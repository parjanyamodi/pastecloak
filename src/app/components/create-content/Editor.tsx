import { Textarea } from "@nextui-org/react";

export default function Editor({
  content,
  setContent,
}: {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <Textarea
      className="h-fit"
      fullWidth
      disableAutosize
      placeholder="Place your content here!"
      value={content}
      onValueChange={setContent}
      classNames={{
        base: "w-full",
        input: "resize-y min-h-[500px]",
      }}
    />
  );
}
