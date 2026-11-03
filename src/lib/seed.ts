import type { DatabaseSync } from "node:sqlite";
import { estimatePrice } from "./pricing";
import type { Part } from "./types";

// A fictional yard for live demos (/y/demo, /admin/demo). Owner password: "demo".
// scrypt hash of "demo" with salt "demo-salt" (see auth.ts hashPassword format).
const DEMO_PASSWORD_HASH =
  "scrypt$demo-salt$cc7e6ed02a9edcd7a50224553ad38a69b657ed2470090a9b2d7bcb6d09a07632";

// Every demo part has a real photo used under a Creative Commons license (credited on the part page).
// Where the photo's source identifies the vehicle, the listing matches it; otherwise it's a representative
// photo of that part type, and the credit line says "Sample photo".
type DemoPart = {
  stock: string;
  year: number;
  make: string;
  model: string;
  part: string;
  note: string;
  grade: string;
  miles: number | null;
  price: number | null; // dollars; null = not priced yet (shows off price research)
  core?: number;
  photo: string;
  credit: string; // "text|source url"
};

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

const PARTS: DemoPart[] = [
  {
    stock: "A2101", year: 2021, make: "BMW", model: "530i", part: "Headlight Assembly",
    note: "Full LED with control units. Lens clear, all tabs intact.", grade: "A", miles: 38950, price: 895,
    photo: "/marketing/headlight-bmw-g30-led.png", credit: `Photo: UAB Partecha, CC BY-SA 4.0|${commons("Car_headlamp.png")}`,
  },
  {
    stock: "F1004", year: 2004, make: "Ford", model: "Ranger", part: "Engine",
    note: "3.0L V6 (Vulcan). Pulled complete with intake, injectors and exhaust manifold. Compression checked.", grade: "B", miles: 118400, price: 895,
    photo: "/demo-parts/engine.jpg", credit: `Sample photo: Dana60Cummins, CC BY-SA 3.0 (cropped)|${commons("Ford_3.0_V6_engine.jpg")}`,
  },
  {
    stock: "D9942", year: 1999, make: "Dodge", model: "Dakota", part: "Transmission",
    note: "42RE automatic, 2WD. Shifted through all gears before pull.", grade: "B", miles: 142300, price: 425,
    photo: "/demo-parts/transmission-42re.jpg", credit: `Photo: Dana60Cummins, CC BY-SA 3.0|${commons("2011-07-11_20.15.54.jpg")}`,
  },
  {
    stock: "B7038", year: 2000, make: "BMW", model: "7 Series", part: "Rear Differential",
    note: "E38 rear differential. Outside weathered, no leaks, turns smooth.", grade: "C", miles: 164000, price: 275,
    photo: "/demo-parts/rear-differential.jpg", credit: `Photo: Beemwej, CC BY-SA 3.0|${commons("Bmw_7_dyfer.JPG")}`,
  },
  {
    stock: "H8241", year: 1987, make: "Honda", model: "CRX", part: "Cylinder Head",
    note: "Si, D15A3 SOHC. Complete with camshaft, rockers and cam gear. Checked flat.", grade: "A", miles: 121000, price: 185,
    photo: "/demo-parts/cylinder-head.jpg", credit: `Photo: Ian Brockhoff, CC BY-SA 3.0|${commons("Head_D15A3.JPG")}`,
  },
  {
    stock: "G9011", year: 1990, make: "Geo", model: "Storm", part: "Engine Control Module (ECM)",
    note: "GSi. With mounting bracket.", grade: "A", miles: 132500, price: null,
    photo: "/demo-parts/ecu.jpg", credit: `Photo: Ildar Sagdejev (Specious), CC BY-SA 3.0|${commons("2008-04-17_ECU.jpg")}`,
  },
  {
    stock: "G9012", year: 1990, make: "Geo", model: "Storm", part: "Brake Master Cylinder",
    note: "GSi. With reservoir and cap.", grade: "B", miles: 132500, price: 45,
    photo: "/demo-parts/brake-master-cylinder.jpg", credit: `Photo: Ildar Sagdejev (Specious), CC BY-SA 4.0|${commons("2008-04-21_1990_Geo_Storm_GSi_master_cylinder.jpg")}`,
  },
  {
    stock: "T3310", year: 2008, make: "Honda", model: "Accord", part: "Alternator",
    note: "2.4L. Bench tested.", grade: "A", miles: 96400, price: 85, core: 15,
    photo: "/demo-parts/alternator.jpg", credit: `Sample photo: EL Guarito, CC BY-SA 3.0|${commons("Alternador_003.jpg")}`,
  },
  {
    stock: "C5520", year: 2012, make: "Chevrolet", model: "Silverado 1500", part: "Starter",
    note: "5.3L. Bench tested.", grade: "A", miles: 104800, price: 65, core: 10,
    photo: "/demo-parts/starter-motor.jpg", credit: `Sample photo: Willdre, CC BY-SA 3.0|${commons("Automobile_starter.JPG")}`,
  },
  {
    stock: "T4417", year: 2009, make: "Toyota", model: "Corolla", part: "Steering Rack",
    note: "Hydraulic power steering, with tie rods and boots.", grade: "B", miles: 151200, price: null, core: 25,
    photo: "/demo-parts/steering-rack.jpg", credit: `Sample photo: l0lnix, CC BY 2.0|${commons("Power_steering_rack.jpg")}`,
  },
  {
    stock: "T5123", year: 2006, make: "Toyota", model: "Camry", part: "Catalytic Converter",
    note: "Sold to verified repair shops only.", grade: "B", miles: 188000, price: null,
    photo: "/demo-parts/catalytic-converter.jpg", credit: `Sample photo: Santeri Viinamäki, CC BY-SA 4.0|${commons("Catalytic_converter_20230510.jpg")}`,
  },
  {
    stock: "G9013", year: 1990, make: "Geo", model: "Storm", part: "Hood",
    note: "GSi. Yellow. Off the same donor car as the ECM and master cylinder.", grade: "B", miles: 132500, price: 95,
    photo: "/demo-parts/hood.jpg", credit: `Photo: Ildar Sagdejev (Specious), CC BY-SA 3.0|${commons("2008-04-19_Yellow_hood.jpg")}`,
  },
  {
    stock: "G9014", year: 1990, make: "Geo", model: "Storm", part: "Instrument Cluster",
    note: "GSi. Tachometer, MPH speedometer, fuel and temperature gauges.", grade: "A", miles: 132500, price: 65,
    photo: "/demo-parts/instrument-cluster.jpg", credit: `Photo: Ildar Sagdejev (Specious), CC BY-SA 4.0|${commons("2008-04-06_Geo_Storm_GSi_instrument_gauge_cluster_(front).jpg")}`,
  },
  {
    stock: "G9015", year: 1990, make: "Geo", model: "Storm", part: "Seat",
    note: "Driver front, with headrest and slide rails.", grade: "B", miles: 132500, price: 85,
    photo: "/demo-parts/seat.jpg", credit: `Photo: Ildar Sagdejev (Specious), CC BY-SA 4.0|${commons("2008-08-16_Geo_Storm_front_left_seat.jpg")}`,
  },
  {
    stock: "G9016", year: 1990, make: "Geo", model: "Storm", part: "Steering Wheel",
    note: "GSi. Airbag module not included.", grade: "B", miles: 132500, price: 40,
    photo: "/demo-parts/steering-wheel.jpg", credit: `Photo: Ildar Sagdejev (Specious), CC BY-SA 4.0|${commons("2008-04-04_Geo_Storm_steering_wheel.jpg")}`,
  },
  {
    stock: "G9017", year: 1990, make: "Geo", model: "Storm", part: "Liftgate",
    note: "GSi rear hatch. Yellow, with glass and gas struts. Local pickup or freight only.", grade: "B", miles: 132500, price: 165,
    photo: "/demo-parts/tailgate.jpg", credit: `Photo: Ildar Sagdejev (Specious), CC BY-SA 4.0|${commons("2008-05-30_1990_Geo_Storm_GSi_rear_hatch_underside.jpg")}`,
  },
  {
    stock: "J2014", year: 2014, make: "Jeep", model: "Grand Cherokee", part: "Wheel",
    note: "Polished multi-spoke alloy. Priced per wheel; four available.", grade: "A", miles: 58200, price: 165,
    photo: "/demo-parts/alloy-wheel.jpg", credit: `Photo: Jwh, CC BY-SA 3.0|${commons("Jeep_Grand_Cherokee_wheels-101.jpg")}`,
  },
  {
    stock: "H0501", year: 2001, make: "Honda", model: "Accord", part: "Radio",
    note: "Factory CD and cassette head unit. Unlock code not included.", grade: "B", miles: 171900, price: 55,
    photo: "/demo-parts/radio.jpg", credit: `Sample photo: KSC60, CC BY-SA 4.0|${commons("Car_radio_with_both_CD_and_compact_casette.jpg")}`,
  },
];

export function seedDemoYard(conn: DatabaseSync): void {
  conn
    .prepare(
      `insert into yards (slug, name, tagline, phone, email, address, city, state, zip, hours, about_text, warranty_text, returns_text, pickup_note, brand_color, owner_password_hash)
       values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      "demo",
      "Demo Auto Recycling",
      "Quality used OEM parts — pulled, tested and ready to ship.",
      "(555) 010-0199",
      "parts@example.com",
      "1200 Salvage Rd",
      "Anytown",
      "IL",
      "60018",
      "Mon–Fri 8:00 AM – 5:00 PM\nSat 8:00 AM – 12:00 PM\nSun Closed",
      "Family-owned full-service auto recycler since 1987. Every part is pulled by our team, cleaned, inspected and graded before it goes on the shelf. We ship nationwide and load local pickups at the counter.",
      "Every part carries our standard 90-day parts warranty. Extended warranties (6 months or 1 year) are available at checkout on engines, transmissions and most mechanical parts.",
      "Returns are accepted within 30 days for exchange or refund. Electrical parts must be returned unopened from the static bag. Core charges are refunded when the old part is returned in rebuildable condition.",
      "Local pickup is free at our counter, usually ready within 2 hours. Big parts (engines, transmissions, bumpers, doors) ship by freight or are picked up.",
      "#1e3a5f",
      DEMO_PASSWORD_HASH,
    );
  const yardId = Number((conn.prepare("select id from yards where slug = 'demo'").get() as { id: number }).id);
  const insert = conn.prepare(
    `insert into parts (yard_id, stock_no, year, make, model, part_type, description, grade, mileage, price_cents, core_charge_cents, location, photos, photo_credit, updated_at)
     values (?,?,?,?,?,?,?,?,?,?,?,?,?,?, datetime('now', ?))`,
  );
  PARTS.forEach((p, i) => {
    insert.run(
      yardId, p.stock, p.year, p.make, p.model, p.part, p.note, p.grade, p.miles,
      p.price == null ? null : p.price * 100, (p.core ?? 0) * 100, `Row ${1 + (i % 12)}`,
      JSON.stringify([p.photo]), p.credit, `-${i * 37} minutes`,
    );
  });

  // Price suggestions already waiting for the unpriced parts, so the (read-only) demo admin shows the feature.
  const unpriced = conn.prepare("select * from parts where yard_id = ? and price_cents is null").all(yardId) as Part[];
  const suggest = conn.prepare(
    "update parts set suggested_price_cents = ?, suggestion_source = ?, suggestion_note = ?, suggested_at = datetime('now') where id = ?",
  );
  for (const part of unpriced) {
    const sug = estimatePrice(part);
    suggest.run(sug.cents, sug.source, sug.note, part.id);
  }

  // Two obviously-sample leads so the demo inbox isn't empty.
  const lead = conn.prepare("insert into leads (yard_id, kind, part_id, name, phone, email, zip, data, created_at) values (?,?,?,?,?,?,?,?, datetime('now', ?))");
  const engine = conn.prepare("select id from parts where yard_id = ? and stock_no = 'F1004'").get(yardId) as { id: number } | undefined;
  lead.run(yardId, "part_request", engine?.id ?? null, "Sample Buyer", "(555) 010-0142", "", "60601",
    JSON.stringify({ part: "2004 Ford Ranger Engine (stock #F1004)", price: "$895", delivery: "pickup", warranty: "6-month warranty (+15%)" }), "-3 hours");
  lead.run(yardId, "sell_car", null, "Sample Seller", "(555) 010-0175", "", "60007",
    JSON.stringify({ vehicle: "2007 Honda Civic", runs: "Doesn't run", title: "Clean title", pickup: "Need it towed" }), "-1 day");
}
