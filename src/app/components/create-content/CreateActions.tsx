"use client";
import { storeSecret } from "@/app/actions/secrets.action";
import { Button, Checkbox, Input, Select, SelectItem } from "@nextui-org/react";
import { useRef } from "react";
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
  const expirationTimeSelectRef =
    useRef<HTMLSelectElement>() as React.RefObject<HTMLSelectElement>;
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full flex-col items-center gap-4 sm:justify-between md:flex-row">
        <div className="xs:flex-row flex w-full flex-col gap-4">
          <Button
            size="lg"
            color="danger"
            variant="flat"
            onPress={() => setContent("")}
            className="xs:w-fit w-full"
          >
            Clear
          </Button>
          <Select
            size="sm"
            defaultSelectedKeys={[expirationTimes[0].time.toString()]}
            items={expirationTimes}
            label="Expires In"
            className="xs:min-w-[40%] w-full "
            ref={expirationTimeSelectRef}
          >
            {(expirationTime) => (
              <SelectItem key={expirationTime.time.toString()}>
                {expirationTime.label}
              </SelectItem>
            )}
          </Select>
        </div>
        <div className="xs:flex-row flex w-full flex-col gap-4">
          <Input size="sm" label="Password" />
        </div>
        <div className="flex w-full flex-col gap-0.5 2xl:flex-row 2xl:justify-around">
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
        className="xs:w-fit w-full"
        onPress={async () => {
          console.log(
            await storeSecret({
              secretContent: content,
              expires: Number(expirationTimeSelectRef.current?.value) || 60,
            })
          );
        }}
      >
        Send
      </Button>
    </div>
  );
}
