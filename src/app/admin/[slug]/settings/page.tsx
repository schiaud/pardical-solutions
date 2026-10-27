import { requireYardAdmin } from "@/lib/auth";
import { PasswordForm, SettingsForm, type EditableYard } from "./SettingsForms";

export default async function Settings({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { yard, session } = await requireYardAdmin(slug);
  // Only the editable fields go to the browser — never the owner password hash.
  const editable: EditableYard = {
    slug: yard.slug,
    name: yard.name,
    tagline: yard.tagline,
    phone: yard.phone,
    email: yard.email,
    address: yard.address,
    city: yard.city,
    state: yard.state,
    zip: yard.zip,
    hours: yard.hours,
    about_text: yard.about_text,
    warranty_text: yard.warranty_text,
    returns_text: yard.returns_text,
    pickup_note: yard.pickup_note,
    brand_color: yard.brand_color,
    logo_url: yard.logo_url,
    custom_domain: yard.custom_domain ?? "",
  };
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="rounded-xl bg-white border border-slate-200 p-6">
        <h1 className="text-xl font-bold text-slate-900">Website settings</h1>
        <p className="mt-1 text-sm text-slate-600">Everything here shows on your website right away.</p>
        <div className="mt-5">
          <SettingsForm yard={editable} />
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-xl bg-white border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Owner sign-in</h2>
          <p className="mt-1 text-sm text-slate-600">
            Sign in at <code className="text-xs">/admin/login</code> with web name <b>{yard.slug}</b>.
          </p>
          <div className="mt-4">
            <PasswordForm slug={yard.slug} isOwner={session.role === "owner"} />
          </div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-5 text-sm text-slate-600">
          <h2 className="font-bold text-slate-900">Your domain stays yours</h2>
          <p className="mt-1">
            Your domain is always registered in your name. If you ever leave, you keep the domain and can download your parts data; the website itself runs while
            the plan is active.
          </p>
        </div>
      </aside>
    </div>
  );
}
