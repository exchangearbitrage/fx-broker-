import Image from "next/image";
import { getBrandConfig } from "@/config/loadBrandConfig";

export function BrandLogo() {
  const brand = getBrandConfig();
  const logo = brand.brand.logoDark || brand.brand.logoLight;

  if (!logo) {
    return (
      <span className="font-heading text-xl font-semibold tracking-normal text-brand-text">
        {brand.brand.name}
      </span>
    );
  }

  return <Image src={logo} alt={brand.brand.name} width={156} height={40} priority className="h-10 w-auto" />;
}
