import { format } from "date-fns";

interface ServiceParty {
  partyName: string;
  partyEmail?: string | null;
  partyAddress?: string | null;
  partyRole?: string | null;
  method: string;
}

const METHOD_TEXT: Record<string, string> = {
  E_SERVICE: "electronically filing the foregoing document using the Indiana E-Filing System, which will send notification of such filing to",
  MAIL: "placing a copy thereof in the United States mail, first-class postage prepaid, addressed to",
  PERSONAL: "hand-delivering a copy thereof to",
  PUBLICATION: "publication in accordance with Indiana Trial Rule 4.13 to",
};

function buildPartyText(party: ServiceParty): string {
  const methodText = METHOD_TEXT[party.method] || "serving";
  let text = `${methodText} ${party.partyName}`;
  if (party.partyRole) {
    text += `, ${party.partyRole}`;
  }
  if (party.method === "MAIL" && party.partyAddress) {
    text += `, at ${party.partyAddress}`;
  } else if (party.method === "E_SERVICE" && party.partyEmail) {
    text += `, at ${party.partyEmail}`;
  }
  return text;
}

export function generateCertificateOfService(
  parties: ServiceParty[],
  date?: Date
): Record<string, unknown> {
  const certDate = date || new Date();
  const formattedDate = format(certDate, "MMMM d, yyyy");

  if (parties.length === 0) {
    return {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3, textAlign: "center" },
          content: [{ type: "text", text: "CERTIFICATE OF SERVICE" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "No service parties specified." }],
        },
      ],
    };
  }

  const serviceLines: string[] = [];
  for (let i = 0; i < parties.length; i++) {
    const partyText = buildPartyText(parties[i]);
    if (i === 0) {
      serviceLines.push(partyText);
    } else if (i === parties.length - 1) {
      serviceLines.push(`and by ${partyText}`);
    } else {
      serviceLines.push(`by ${partyText}`);
    }
  }

  const certText =
    `I hereby certify that on ${formattedDate}, I ` +
    serviceLines.join("; ") +
    ".";

  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 3, textAlign: "center" },
        content: [{ type: "text", text: "CERTIFICATE OF SERVICE" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: certText }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "right" },
        content: [{ type: "text", text: "/s/ ____________________________" }],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "right" },
        content: [{ type: "text", text: "Attorney for Defendant" }],
      },
    ],
  };
}
