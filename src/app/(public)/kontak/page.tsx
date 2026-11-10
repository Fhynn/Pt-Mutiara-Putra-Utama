import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/public/page-hero";
import { getSettings } from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Kontak",
  description: "Kontak resmi dan formulir pesan PT Mutiara Putra Utama."
};

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero
        breadcrumb="Kontak"
        title="Hubungi PT Mutiara Putra Utama"
        description="Gunakan kontak resmi dan jangan mengirim dokumen pribadi sebelum kebutuhan serta saluran pengiriman diverifikasi."
      />
      <section className="section section-muted">
        <div className="container form-shell">
          <aside>
            <span className="eyebrow">Kantor Pusat</span>
            <h2 className="section-title">Informasi kontak</h2>
            <p className="lead">{settings.address}</p>
            <div className="content-card">
              <p>
                <strong>Telepon</strong>
                <br />
                {settings.phone}
              </p>
              <p>
                <strong>Email</strong>
                <br />
                {settings.primaryEmail}
                <br />
                {settings.alternateEmail}
              </p>
              {settings.officeHours ? (
                <p>
                  <strong>Jam operasional</strong>
                  <br />
                  {settings.officeHours}
                </p>
              ) : (
                <p className="form-note">
                  Hubungi kantor terlebih dahulu untuk memastikan waktu kunjungan.
                </p>
              )}
              <p className="form-note">
                Nomor telepon tidak otomatis dianggap sebagai WhatsApp. Tombol WhatsApp akan aktif
                setelah nomor resmi diberikan.
              </p>
            </div>
          </aside>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
