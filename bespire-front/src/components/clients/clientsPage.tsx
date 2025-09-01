"use client";

import OverviewMetricsComponent from "./OverviewMetrics";
import ClientList from "./ClientList";
import { mockClients } from "@/mocks/clients";

export default function ClientsPage() {

    return (
        <section className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 flex flex-col gap-6">
            <OverviewMetricsComponent />
            <ClientList clients={mockClients} />
        </section>
    );
}
