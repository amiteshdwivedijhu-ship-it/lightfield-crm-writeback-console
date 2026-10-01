/* Lightfield CRM writeback console (synthetic demo data).
   Fictional companies, people, transcripts. No real customer data,
   no accounts, no model runs in this browser. */

window.LIGHTFIELD_DATA = [
  {
    id: "pilot-review",
    path: "primary",
    meeting: {
      title: "Kestrel Systems - pilot review call",
      date: "Tue, Sep 29 2026",
      duration: "34 min",
      source: "Captured from Cal + Zoom transcript",
      attendees: ["Amara Okafor (Head of Data, Kestrel)", "Daniel Park (AE, Boltware)", "Sophie Wu (Solutions, Boltware)"]
    },
    opportunity: {
      id: "KST-1042",
      name: "Kestrel Systems - AI pipeline pilot",
      account: "Kestrel Systems",
      amount: "$48,000 ARR",
      stage: "Discovery",
      owner: "Daniel Park",
      stageDefinition: "Reflects the customer's stated commitment. Advance only on an explicit commitment, procurement motion, or signed intent. Never infer stage from interest, demos, or next steps."
    },
    transcript: [
      ["Amara", "Thanks for the demo last week. The team liked what they saw, especially the signal feed and the follow-up drafts."],
      ["Daniel", "Glad to hear it. What stood out most?"],
      ["Amara", "The way meeting notes land in the CRM automatically. That alone saves our reps maybe an hour a day."],
      ["Daniel", "Happy to scope that as a pilot. I will send over pricing and a scoping doc."],
      ["Amara", "Please do. Our integration review will go through your API docs this month."],
      ["Daniel", "Good. Any decision date I should track?"],
      ["Amara", "Not yet. We are comparing a couple of options and need finance sign-off before anything moves forward."],
      ["Daniel", "Understood. I will draft the scoping doc so you have everything for that review."],
      ["Amara", "That works for us. Send it to me and I will loop in our engineer."]
    ],
    activity: {
      summary: {
        label: "Summary",
        value: "Kestrel liked the demo, especially automated meeting capture, and wants pricing plus a scoping doc. Still comparing vendors; finance sign-off required before any commitment.",
        confidence: 0.94,
        refs: [0, 2, 3, 6]
      },
      nextStep: {
        label: "Next step",
        value: "Send pricing overview and pilot scoping doc to Amara; check back after the finance review.",
        confidence: 0.9,
        refs: [3, 7],
        due: "Fri, Oct 2",
        owner: "Daniel Park"
      },
      owners: {
        label: "Owners",
        value: "Daniel Park (AE), Sophie Wu (Solutions)",
        confidence: 0.97,
        refs: [7]
      }
    },
    stageProposal: {
      from: "Discovery",
      to: "Negotiation",
      state: "held",
      title: "Stage held: no evidence",
      body: "The capture agent proposed moving KST-1042 from Discovery to Negotiation, but no transcript span supports a commitment. The closest line defers any decision until finance sign-off, so the stage gate keeps the change out and flags the line as holding evidence.",
      rule: "Stage definition: advance only on an explicit commitment, procurement motion, or signed intent. Never infer stage from interest, demos, or next steps.",
      holdRefs: [6],
      evidenceRefs: []
    }
  },
  {
    id: "roi-deep-dive",
    path: "advance",
    meeting: {
      title: "Orelio - ROI deep dive",
      date: "Mon, Sep 28 2026",
      duration: "27 min",
      source: "Captured from Cal + Zoom transcript",
      attendees: ["Priya Raman (VP Ops, Orelio)", "Daniel Park (AE, Boltware)"]
    },
    opportunity: {
      id: "ORL-208",
      name: "Orelio - ops automation rollout",
      account: "Orelio",
      amount: "$62,000 ARR",
      stage: "Discovery",
      owner: "Daniel Park",
      stageDefinition: "Reflects the customer's stated commitment. Advance only on an explicit commitment, procurement motion, or signed intent. Never infer stage from interest, demos, or next steps."
    },
    transcript: [
      ["Priya", "Run us through the pricing again and the ROI case you sent over."],
      ["Daniel", "Sure. The ROI case is built on the time reps save on logging and follow-ups."],
      ["Priya", "That math holds for us. We are moving this to procurement next week."],
      ["Daniel", "Great. Anything we can do to make procurement smoother?"],
      ["Priya", "Contract terms and a security review are the only open items. Consider this a verbal yes, we want to sign before month end."],
      ["Daniel", "Perfect. I will get the security questionnaire to you today and hold the quote as discussed."]
    ],
    activity: {
      summary: {
        label: "Summary",
        value: "Orelio accepted the ROI case, is moving the rollout to procurement next week, and gave a verbal yes with a target signature before month end.",
        confidence: 0.95,
        refs: [2, 4]
      },
      nextStep: {
        label: "Next step",
        value: "Send security questionnaire today, keep quote held, confirm contract terms with legal.",
        confidence: 0.91,
        refs: [5],
        due: "Today",
        owner: "Daniel Park"
      },
      owners: {
        label: "Owners",
        value: "Daniel Park (AE)",
        confidence: 0.98,
        refs: [5]
      }
    },
    stageProposal: {
      from: "Discovery",
      to: "Negotiation",
      state: "ready",
      title: "Stage advance ready: evidence cited",
      body: "Two transcript spans support the move: Orelio is taking the rollout to procurement and gave a verbal yes with a target signature. The stage gate allows the write only with these citations attached.",
      rule: "Stage definition: advance only on an explicit commitment, procurement motion, or signed intent.",
      holdRefs: [],
      evidenceRefs: [2, 4]
    }
  },
  {
    id: "champion-call",
    path: "blocked",
    meeting: {
      title: "Bayline - champion call",
      date: "Fri, Sep 25 2026",
      duration: "22 min",
      source: "Captured from Cal + Zoom transcript",
      attendees: ["Marcus Hale (Dir. Engineering, Bayline)", "Daniel Park (AE, Boltware)"]
    },
    opportunity: {
      id: "BAY-77",
      name: "Bayline - platform consolidation",
      account: "Bayline",
      amount: "$85,000 ARR",
      stage: "Evaluation",
      owner: "Lauren Park",
      stageDefinition: "Reflects the customer's stated commitment. Advance only on an explicit commitment, procurement motion, or signed intent. Never infer stage from interest, demos, or next steps. Closed Won requires an executed contract."
    },
    transcript: [
      ["Marcus", "This is the strongest option we have looked at. I am pushing hard internally."],
      ["Daniel", "Glad to hear it. What would help you make the case?"],
      ["Marcus", "Keep the pricing as quoted and give us pull-through for the security questions. I will bring back the exec decision."],
      ["Daniel", "You have both. Anything preventing a signature?"],
      ["Marcus", "Nothing on our side once the execs sign off. I expect that next week."],
      ["Daniel", "Great. I will follow up Thursday."]
    ],
    activity: {
      summary: {
        label: "Summary",
        value: "Marcus is championing Bayline's platform consolidation internally, needs pricing held and security pull-through, and expects an exec decision next week.",
        confidence: 0.93,
        refs: [0, 2, 3, 4]
      },
      nextStep: {
        label: "Next step",
        value: "Hold pricing as quoted, send security pull-through, follow up Thursday.",
        confidence: 0.92,
        refs: [2, 5],
        due: "Thu, Oct 1",
        owner: "Lauren Park"
      },
      owners: {
        label: "Owners",
        value: "Lauren Park (AE)",
        confidence: 0.96,
        refs: [2]
      }
    },
    stageProposal: {
      from: "Evaluation",
      to: "Closed Won",
      state: "blocked",
      title: "Change blocked: cannot invent Closed Won",
      body: "The capture agent tried to mark BAY-77 Closed Won. Closed Won requires an executed contract or signed order; the transcript contains internal advocacy and a pending exec decision, not a signature. The write is blocked and nothing from this attempt reaches the CRM.",
      rule: "Closed Won requires an executed contract. Never infer a win from champion enthusiasm.",
      holdRefs: [2, 4],
      evidenceRefs: []
    }
  }
];