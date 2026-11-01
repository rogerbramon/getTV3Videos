"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchForm() {
  const [videoCode, setVideoCode] = useState<string | undefined>();
  const router = useRouter();

  const updateCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const ids = event.target.value.split("/").filter((element) => {
      return element.match(/^\d+$/);
    });
    if (ids.length > 0) {
      setVideoCode(ids[ids.length - 1]);
    } else {
      setVideoCode(undefined);
    }
  };

  const handleSearch = () => {
    if (videoCode) {
      router.push(`/video/${videoCode}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="my-6">
      <label htmlFor="video-code" className="block text-xl text-muted-foreground mb-3">
        Introduïu l'adreça del vídeo
      </label>
      <div className="flex gap-3">
        <Input
          id="video-code"
          onChange={updateCode}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="https://www.ccma.cat/tv3/alacarta/les-de-lhoquei/anna/video/5851449/"
          className="flex-grow h-10 text-base"
        />
        <Button
          onClick={handleSearch}
          disabled={!videoCode}
          className="w-[200px] h-10 text-base"
        >
          Buscar
        </Button>
      </div>
    </div>
  );
}

