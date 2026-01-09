import type { SkillItem } from "@/lib/portfolio/types";
import { IconSkillPlaceholder } from "@/components/icons";

export function Skills(props: { title: string; items: SkillItem[] }) {
  return (
    <section className="pt-14 md:pt-18" id="skills">
      <div className="container-shell">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-(--muted)">
          {props.title}
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {props.items.map((s) => (
            <div
              key={`${s.label}:${s.icon}`}
              className="flex items-center gap-3 rounded-[999px] border border-(--border) bg-(--surface) px-4 py-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-(--surface-2) text-(--foreground)">
                <IconSkillPlaceholder className="h-5 w-5" title={s.icon} />
              </span>
              <span className="text-sm font-semibold">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
