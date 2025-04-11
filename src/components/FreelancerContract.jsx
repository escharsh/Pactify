"use client";
import { cn } from "../lib/utils";

import { useNavigate } from "react-router-dom";

export function FreelancerContract() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/ContractForm?type=Freelance Contract");
  };

  return (
    <div className="max-w-xs w-full" onClick={handleClick}>
        
      <div
        className={cn(
          "group w-full cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border border-transparent dark:border-neutral-800",
          `bg-[url(/freelancercontract.png)] bg-cover`,
          // Preload hover image by setting it in a pseudo-element
          `before:bg-[url(/card4.gif)] before:fixed before:inset-0 before:opacity-0 before:z-[-1]`,
          `hover:bg-[url(/card4.gif)]`,
          "hover:after:content-[''] hover:after:absolute hover:after:inset-0 hover:after:bg-black hover:after:opacity-50",
          "transition-all duration-500"
        )}> 
        <div className="text relative z-50">
          <h1 className="font-bold text-xl md:text-3xl text-gray-50 relative">
            Freelancer Contract
          </h1>
          <p className="font-normal text-base text-gray-50 relative my-4">
          A legally binding freelance contract document for project-based work.
          </p>
        </div>
      </div>
    </div>
  );
}
