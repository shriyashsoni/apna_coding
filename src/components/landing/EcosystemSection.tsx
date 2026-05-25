import React from "react";
import { motion } from "framer-motion";

export function EcosystemSection() {
  return (
    <section className="py-28 border-t border-border/30 bg-background overflow-hidden relative z-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em] mb-4 block">Ecosystem</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Built with the Global Web3 Community</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-3">
            Connecting developers and innovators across blockchain ecosystems
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground bg-muted/20 border border-border/50 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
            Engaging with 80+ Web3 Communities Worldwide
          </span>
        </motion.div>
        
        {/* Row 1: Core L1s & Ethereum Stack - Scroll Left */}
        <div className="mb-6 relative">
          <div className="flex gap-6 animate-scroll-left">
            {[...Array(2)].map((_, setIndex) => (
              <div key={`row1-set-${setIndex}`} className="flex gap-6 flex-shrink-0">
                {[
                  "https://harmless-tapir-303.convex.cloud/api/storage/b7688aec-6fb3-4ee8-a2c6-379995f90a4f",
                  "https://harmless-tapir-303.convex.cloud/api/storage/a11930f7-3658-401c-bafd-54ffa7d101ea",
                  "https://harmless-tapir-303.convex.cloud/api/storage/17da4dd8-5242-4e76-a4fe-c4be534f0d1e",
                  "https://harmless-tapir-303.convex.cloud/api/storage/6133421f-2615-49a1-9f9d-631c3b14affb",
                  "https://harmless-tapir-303.convex.cloud/api/storage/c6e29be2-8849-4b77-903a-5e414c992d94",
                  "https://harmless-tapir-303.convex.cloud/api/storage/9c6207d8-b71c-4548-be69-fb0f8588e659",
                  "https://harmless-tapir-303.convex.cloud/api/storage/b55ff729-32ea-4cb7-8aaa-4885aaa24dce",
                  "https://harmless-tapir-303.convex.cloud/api/storage/868d376e-037d-4a78-9444-1d20e8ff8318",
                  "https://harmless-tapir-303.convex.cloud/api/storage/cba8b875-2b84-42dd-85f9-7fbb932defad",
                  "https://harmless-tapir-303.convex.cloud/api/storage/602ec7a3-746f-4329-9ac8-854e3d36440a",
                  "https://harmless-tapir-303.convex.cloud/api/storage/050cb42f-ea53-41ed-8a3a-71bbabbcbcba",
                  "https://harmless-tapir-303.convex.cloud/api/storage/8b5baeca-0701-45d8-a57b-72c632a8ff5f",
                  "https://harmless-tapir-303.convex.cloud/api/storage/ccad1050-ab7e-4b0b-b69b-5fbabe548289",
                  "https://harmless-tapir-303.convex.cloud/api/storage/70ea7451-f8ab-41b0-859b-48426bd5d3b3",
                  "https://harmless-tapir-303.convex.cloud/api/storage/3f693122-3353-4fe1-b2d8-9440f33350cd",
                  "https://harmless-tapir-303.convex.cloud/api/storage/ea786302-56f9-4ae7-ad2a-cf57b38a2255",
                  "https://harmless-tapir-303.convex.cloud/api/storage/271a847c-281c-4a81-8901-a13a6e796c0e",
                ].map((logo, i) => (
                  <div 
                    key={`${setIndex}-${i}`} 
                    className="flex-shrink-0 bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                    style={{ width: '140px', height: '80px' }}
                  >
                    <img 
                      src={logo} 
                      alt={`Ecosystem ${i + 1}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Infrastructure & Scaling - Scroll Right */}
        <div className="mb-6 relative">
          <div className="flex gap-6 animate-scroll-right">
            {[...Array(2)].map((_, setIndex) => (
              <div key={`row2-set-${setIndex}`} className="flex gap-6 flex-shrink-0">
                {[
                  "https://harmless-tapir-303.convex.cloud/api/storage/40dc1858-5b12-496a-a64a-ac24226b8089",
                  "https://harmless-tapir-303.convex.cloud/api/storage/f7be41f0-72cd-4403-ab76-204a8512829d",
                  "https://harmless-tapir-303.convex.cloud/api/storage/a1f1b599-ec60-436a-b973-97acf2535fc6",
                  "https://harmless-tapir-303.convex.cloud/api/storage/62eb4d82-e806-4301-b111-d2b1d0843d3a",
                  "https://harmless-tapir-303.convex.cloud/api/storage/f2be8bd0-1c8f-4751-b3e3-a1cd0cd37341",
                  "https://harmless-tapir-303.convex.cloud/api/storage/6b2b5ccb-0db5-4305-8152-30b0f87955a7",
                  "https://harmless-tapir-303.convex.cloud/api/storage/4b44ab99-971e-45b4-8380-593e85c77f01",
                  "https://harmless-tapir-303.convex.cloud/api/storage/e7e2891f-737a-4f73-88d4-701dbde3b1b7",
                  "https://harmless-tapir-303.convex.cloud/api/storage/e00bb3e1-e1e9-4c58-a534-69a680e2eb19",
                  "https://harmless-tapir-303.convex.cloud/api/storage/b2813d50-46a7-4c03-9a38-4c20ef414775",
                  "https://harmless-tapir-303.convex.cloud/api/storage/5332eabc-25f5-45d8-9f75-63c3b9da520a",
                  "https://harmless-tapir-303.convex.cloud/api/storage/60568423-6549-472f-8653-df1dfb4cc2c2",
                  "https://harmless-tapir-303.convex.cloud/api/storage/cde0d6d5-5437-4629-8db7-ba58a53d967a",
                  "https://harmless-tapir-303.convex.cloud/api/storage/91c84051-87d0-4700-8ed6-166accd2ef49",
                  "https://harmless-tapir-303.convex.cloud/api/storage/52f06c3a-a0d2-4340-bad8-2f0addc77bb5",
                  "https://harmless-tapir-303.convex.cloud/api/storage/93c8024e-fe9d-48ce-9a25-373b4366555e",
                  "https://harmless-tapir-303.convex.cloud/api/storage/b406469a-f689-4f55-afdd-86dcaa97706c",
                ].map((logo, i) => (
                  <div 
                    key={`${setIndex}-${i}`} 
                    className="flex-shrink-0 bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                    style={{ width: '140px', height: '80px' }}
                  >
                    <img 
                      src={logo} 
                      alt={`Ecosystem ${i + 18}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: Interoperability & Ecosystem Tools - Scroll Left */}
        <div className="relative">
          <div className="flex gap-6 animate-scroll-left-slow">
            {[...Array(2)].map((_, setIndex) => (
              <div key={`row3-set-${setIndex}`} className="flex gap-6 flex-shrink-0">
                {[
                  "https://harmless-tapir-303.convex.cloud/api/storage/8424d683-4767-4de9-8bff-71f0c27f1bae",
                  "https://harmless-tapir-303.convex.cloud/api/storage/cd41e4e7-9f2d-41d2-bdc5-664d06705bf1",
                  "https://harmless-tapir-303.convex.cloud/api/storage/c015978b-796b-40d8-b5b8-9d2018603156",
                  "https://harmless-tapir-303.convex.cloud/api/storage/ebb818a3-5c56-4834-be7c-f8dc551baeb6",
                  "https://harmless-tapir-303.convex.cloud/api/storage/de8e8618-dfdc-4a5f-9827-dbb9db0683d8",
                  "https://harmless-tapir-303.convex.cloud/api/storage/27ac24bd-d3f0-4295-a6c8-684b308dba4b",
                  "https://harmless-tapir-303.convex.cloud/api/storage/b77bdd39-84db-4456-bed6-80ee179a4a73",
                  "https://harmless-tapir-303.convex.cloud/api/storage/6648cf51-7020-4944-b71e-62f85536cbbb",
                  "https://harmless-tapir-303.convex.cloud/api/storage/ab51017d-e4e1-43bc-a572-a1098592dcff",
                  "https://harmless-tapir-303.convex.cloud/api/storage/dea23233-d170-4c5c-a01c-ee8eea765053",
                  "https://harmless-tapir-303.convex.cloud/api/storage/f8233ff4-b16e-41f5-a3e1-9809d170b33c",
                  "https://harmless-tapir-303.convex.cloud/api/storage/0d645d11-fcda-49b5-b6ce-8571898e0384",
                  "https://harmless-tapir-303.convex.cloud/api/storage/0e2888d5-94ef-470d-9eae-a54347237f75",
                  "https://harmless-tapir-303.convex.cloud/api/storage/54ae71ad-0956-47e9-a029-62179e65cc81",
                  "https://harmless-tapir-303.convex.cloud/api/storage/1ce3c328-d9a8-49d4-b3a8-32e68d87f875",
                  "https://harmless-tapir-303.convex.cloud/api/storage/88b955e8-cdf2-43bd-852b-eec18c6d74eb",
                  "https://harmless-tapir-303.convex.cloud/api/storage/f951ca7a-6cee-42ce-8817-02f9ee88ddff",
                ].map((logo, i) => (
                  <div 
                    key={`${setIndex}-${i}`} 
                    className="flex-shrink-0 bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                    style={{ width: '140px', height: '80px' }}
                  >
                    <img 
                      src={logo} 
                      alt={`Ecosystem ${i + 35}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
