"use client";

import Input from "@/components/ui/form/input";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { motion } from "motion/react";
import { useState } from "react";

export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [focused, setFocused] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      transition={{ ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      animate={{ opacity: 1, y: 0, scale: focused ? 1.02 : 1 }}
    >
      <Input
        className="hover:shadow-lg focus:shadow-lg bg-white"
        autoComplete="off"
        placeholder="Search..."
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("search") || ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </motion.div>
  );
}
