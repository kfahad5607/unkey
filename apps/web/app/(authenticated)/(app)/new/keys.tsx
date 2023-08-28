"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useOrganizationList } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Lock, KeyRound, PlusCircle, AlertTriangle } from "lucide-react";
import { Loading } from "@/components/dashboard/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/lib/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Workspace } from "@unkey/db";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Text } from "@/components/dashboard/text";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code } from "@/components/ui/code";
import { VisibleButton } from "@/components/dashboard/visible-button";
import { CopyButton } from "@/components/dashboard/copy-button";
import { EmptyPlaceholder } from "@/components/dashboard/empty-placeholder";
import Link from "next/link";
const _formSchema = z.object({
  name: z.string().min(3, "Name is required and should be at least 3 characters").max(50),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-zA-Z0-9-_\.]+$/),
  plan: z.enum(["free", "pro"]),
});

type Steps =
  | {
      step: "CREATE_ROOT_KEY";
      key?: never;
      rootKey?: never;
    }
  | {
      step: "CREATE_KEY";
      key?: never;
      rootKey: string;
    }
  | {
      step: "VERIFY_KEY";
      key?: string;
      rootKey?: never;
    };

type Props = {
  apiId: string;
};

export const Keys: React.FC<Props> = ({ apiId }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Steps>({ step: "CREATE_ROOT_KEY" });
  const rootKey = trpc.key.createInternalRootKey.useMutation({
    onSuccess(res) {
      setStep({ step: "CREATE_KEY", rootKey: res.key });
    },
    onError(err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });
  const key = trpc.key.create.useMutation({
    onSuccess(res) {
      setStep({ step: "VERIFY_KEY", key: res.key });
    },
    onError(err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const [showKey, setShowKey] = useState(false);
  const [showKeyInSnippet, setShowKeyInSnippet] = useState(false);

  const createKeySnippet = `curl -XPOST '${
    process.env.NEXT_PUBLIC_UNKEY_API_URL ?? "https://api.unkey.dev"
  }/v1/keys' \\
  -H 'Authorization: Bearer ${rootKey.data?.key}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "apiId": "${apiId}"
  }'
  `;

  const verifyKeySnippet = `curl -XPOST '${
    process.env.NEXT_PUBLIC_UNKEY_API_URL ?? "https://api.unkey.dev"
  }/v1/keys/verify' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "key": "${key.data?.key ?? "<YOUR_KEY>"}"
  }'
  `;

  function maskKey(key: string): string {
    const split = key.split("_");
    if (split.length === 1) {
      return "*".repeat(split.at(0)!.length);
    }
    return `${split.at(0)}_${"*".repeat(split.at(1)!.length)}`;
  }

  return (
    <div className="flex items-start justify-between gap-16">
      <main className="w-3/4">
        {step.step === "CREATE_ROOT_KEY" ? (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Description>
              Let's begin by creating a root key
            </EmptyPlaceholder.Description>

            <Button disabled={rootKey.isLoading} onClick={() => rootKey.mutate()}>
              {rootKey.isLoading ? <Loading /> : "Create Root Key"}
            </Button>
          </EmptyPlaceholder>
        ) : step.step === "CREATE_KEY" ? (
          <Card>
            <CardHeader>
              <CardTitle>Create a key for your users</CardTitle>
              <CardDescription>
                This key is only shown once and can not be recovered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Code className="flex items-center justify-between w-full gap-4 my-8 ">
                {showKey ? step.rootKey : maskKey(step.rootKey)}
                <div className="flex items-start justify-between gap-4">
                  <VisibleButton isVisible={showKey} setIsVisible={setShowKey} />
                  <CopyButton value={step.rootKey} />
                </div>
              </Code>

              <p className="mt-2 text-sm font-medium text-center text-stone-700 ">
                Try creating a new api key for your users:
              </p>
              <Code className="flex items-start justify-between w-full gap-4 my-8 ">
                {showKeyInSnippet
                  ? createKeySnippet
                  : createKeySnippet.replace(step.rootKey, maskKey(step.rootKey))}
                <div className="flex items-start justify-between gap-4">
                  <VisibleButton isVisible={showKeyInSnippet} setIsVisible={setShowKeyInSnippet} />
                  <CopyButton value={createKeySnippet} />
                </div>
              </Code>
            </CardContent>
            <CardFooter className="justify-between">
              <Button size="sm" variant="link" onClick={() => key.mutate({ apiId })}>
                Or click here to create a key
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setStep({ step: "VERIFY_KEY" });
                }}
              >
                I have created a key
              </Button>
            </CardFooter>
          </Card>
        ) : step.step === "VERIFY_KEY" ? (
          <Card>
            <CardHeader>
              <CardTitle>Verify a key</CardTitle>
              <CardDescription>Use the key you created and verify it.</CardDescription>
            </CardHeader>
            <CardContent>
              {step.key ? (
                <Code className="flex items-center justify-between w-full gap-4 my-8 ">
                  {showKey ? step.key : maskKey(step.key)}
                  <div className="flex items-start justify-between gap-4">
                    <VisibleButton isVisible={showKey} setIsVisible={setShowKey} />
                    <CopyButton value={step.key} />
                  </div>
                </Code>
              ) : null}

              <Code className="flex items-start justify-between w-full gap-4 my-8 ">
                {step.key
                  ? showKeyInSnippet
                    ? verifyKeySnippet
                    : verifyKeySnippet.replace(step.key, maskKey(step.key))
                  : verifyKeySnippet}
                <div className="flex items-start justify-between gap-4">
                  {step.key ? (
                    <VisibleButton
                      isVisible={showKeyInSnippet}
                      setIsVisible={setShowKeyInSnippet}
                    />
                  ) : null}
                  <CopyButton value={verifyKeySnippet} />
                </div>
              </Code>
            </CardContent>
            <CardFooter className="justify-between">
              <Link href="https://docs.unkey.dev" target="_blank">
                <Button size="sm" variant="link">
                  Read more
                </Button>
              </Link>
              <Link href="/app">
                <Button size="sm">Let's go</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : null}
      </main>
      <aside className="flex flex-col items-start justify-center w-1/4 space-y-16">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-4 border rounded-full bg-primary/5">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h4 className="text-lg font-medium">Root Keys</h4>
          <p className="text-sm text-muted-foreground">
            Root keys create resources such as keys or APIs on Unkey. You should never give this to
            your users.
          </p>
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-4 border rounded-full bg-primary/5">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <h4 className="text-lg font-medium">Regular Keys</h4>
          <p className="text-sm text-muted-foreground">
            Regular API keys are used to authenticate your users. You can use your root key to
            create regular API keys and give them to your users.
          </p>
        </div>
      </aside>
    </div>
  );
};