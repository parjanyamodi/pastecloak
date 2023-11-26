"use client";
import { Button, Checkbox, Input, Select, SelectItem } from "@nextui-org/react";
import { TiTick } from "react-icons/ti";
export default function CreateActions({
  content,
  setContent,
}: {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}) {
  const expirationTimes = [
    {
      label: "1 Minute",
      time: 60,
    },
    {
      label: "5 Minutes",
      time: 300,
    },
    {
      label: "10 Minutes",
      time: 600,
    },
    {
      label: "1 Hour",
      time: 3600,
    },
    {
      label: "1 Day",
      time: 86400,
    },
    {
      label: "1 Week",
      time: 604800,
    },
    {
      label: "1 Month",
      time: 2.628e6,
    },
    {
      label: "1 Year",
      time: 3.154e7,
    },
    {
      label: "Never (couldn't find infinite, thus 10000000000 century",
      time: 3.1536e19,
    },
  ];
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-col items-center md:flex-row sm:justify-between w-full gap-4">
        <div className="flex flex-col xs:flex-row w-full gap-4">
          <Button
            size="lg"
            color="danger"
            variant="flat"
            onPress={() => setContent("")}
            className="w-full xs:w-fit"
          >
            Clear
          </Button>
          <Select
            size="sm"
            defaultSelectedKeys={[expirationTimes[0].time.toString()]}
            items={expirationTimes}
            label="Expires In"
            className="w-full xs:min-w-[40%] "
          >
            {(expirationTime) => (
              <SelectItem key={expirationTime.time.toString()}>
                {expirationTime.label}
              </SelectItem>
            )}
          </Select>
        </div>
        <div className="flex flex-col xs:flex-row w-full gap-4">
          <Input size="sm" label="Password" />
        </div>
        <div className="flex flex-col 2xl:flex-row w-full gap-0.5 2xl:justify-around">
          <Checkbox className="whitespace-pre">Burn after reading</Checkbox>
          <Checkbox className="whitespace-pre">
            Allow discussions in thread
          </Checkbox>
        </div>
      </div>
      <Button
        size="lg"
        color="success"
        variant="flat"
        className="w-full xs:w-fit"
      >
        Send
      </Button>
    </div>
  );
}
