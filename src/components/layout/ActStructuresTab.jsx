import React, { useState } from 'react';

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-purple-300 mb-3 border-b border-purple-500/30 pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function StructureCard({ id, title, source, division, symmetric, genres, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-800/50 rounded border border-purple-500/20">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors"
      >
        <span className={`transition-transform inline-block text-xs text-purple-400 ${open ? 'rotate-90' : ''}`}>
          {'\u25B6'}
        </span>
        <span className="font-semibold text-white text-sm flex-1">{id}. {title}</span>
        {symmetric && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-blue-600/40">
            {symmetric}
          </span>
        )}
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2 border-t border-purple-500/10 mt-0">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] mt-2">
            <span><span className="text-purple-400">Source:</span> <span className="text-purple-200">{source}</span></span>
            <span><span className="text-purple-400">Division:</span> <span className="text-purple-200">{division}</span></span>
            {genres && <span><span className="text-purple-400">Genres:</span> <span className="text-purple-200">{genres}</span></span>}
          </div>
          <div className="text-xs text-purple-200 leading-relaxed">{children}</div>
        </div>
      )}
    </div>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto mt-2 mb-2">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-2 py-1 text-purple-300 font-semibold border-b border-purple-500/30 bg-slate-800/80">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-purple-500/10">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1 text-purple-200">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ActStructuresTab() {
  return (
    <div className="space-y-4 text-sm text-purple-100 leading-relaxed">
      <Section title="Critical Distinction: Acts vs Beats">
        <ul className="list-disc list-inside space-y-1 text-xs text-purple-200">
          <li><strong>Act Structure</strong> = the macro divisions of a story and what percentage each occupies. Answers: &ldquo;How many major sections? How long is each?&rdquo;</li>
          <li><strong>Beat Structure</strong> = specific story moments or turning points that occur at prescribed positions. Answers: &ldquo;What happens at this point in the story?&rdquo;</li>
          <li><strong>Hybrid</strong> = frameworks that define both macro divisions AND specific turning points.</li>
        </ul>
      </Section>

      {/* ===== PART 1: TWO-ACT ===== */}
      <Section title="Part 1: Two-Act Structures">
        <div className="space-y-2">
          <StructureCard
            id="1a" title="Aristotle's Complication / Denouement"
            source="Aristotle, Poetics (c. 335 BCE)"
            division="Complication (~60%) / Denouement (~40%)"
            symmetric="Asymmetric"
          >
            <p>
              <strong>The original two-part division.</strong> Aristotle argued that every drama has a &ldquo;complication&rdquo; (desis) that builds from the beginning to the turning point (peripeteia), and a &ldquo;denouement&rdquo; (lusis) that unravels from the turning point to the end. The peripeteia marks the reversal.
            </p>
          </StructureCard>

          <StructureCard
            id="1b" title="Fichtean Curve"
            source="John Gardner, The Art of Fiction (1983)"
            division="Rising Action (~70%) / Climax + Falling Action (~30%)"
            symmetric="Asymmetric"
            genres="Thrillers, mysteries, horror, action/adventure"
          >
            <p>
              <strong>No exposition act.</strong> Opens immediately in crisis. Rising action is a sawtooth wave of escalating mini-crises. Backstory woven through flashbacks and dialogue. No dedicated setup phase.
            </p>
          </StructureCard>

          <StructureCard
            id="1c" title="Shakespearean Rise-and-Fall"
            source="Structural analysis of Shakespeare's tragedies"
            division="Rise (~50%) / Fall (~50%)"
            symmetric="Symmetric"
          >
            <p>
              <strong>The protagonist rises to power/success in the first half, then falls in the second.</strong> The midpoint reversal is the structural hinge. Also seen in crime narratives (Scarface, Breaking Bad).
            </p>
          </StructureCard>

          <StructureCard
            id="1d" title="Musical / Operetta Two-Act"
            source="Theatrical tradition, 19th century onward"
            division="Act 1 (~55-60%) / Act 2 (~40-45%)"
            symmetric="Roughly"
          >
            <p>
              <strong>Standard for musicals and operettas.</strong> Act 1 establishes situation, characters, and central conflict; ends with a dramatic complication or revelation. Act 2 pursues resolution. The intermission serves as a structural pause. Examples: <em>West Side Story</em>, <em>Hamilton</em>, <em>Les Mis&eacute;rables</em>.
            </p>
          </StructureCard>

          <StructureCard
            id="1e" title="TV Half-Hour Two-Act (Traditional Sitcom)"
            source="Network television format, 1950s onward"
            division="Act 1 (~50%) / Act 2 (~50%), sometimes with Cold Open"
            symmetric="Symmetric"
          >
            <p>
              <strong>Act 1 establishes the situation/conflict; Act 2 complicates and resolves.</strong> Commercial break between acts creates natural cliffhanger. Cold Open (2-3 pages) sometimes precedes Act 1 as a hook. Examples: classic sitcoms (<em>Seinfeld</em>, <em>Friends</em>).
            </p>
          </StructureCard>
        </div>
      </Section>

      {/* ===== PART 2: THREE-ACT ===== */}
      <Section title="Part 2: Three-Act Structures">
        <div className="space-y-2">
          <StructureCard
            id="2a" title="Aristotle's Beginning / Middle / End"
            source="Aristotle, Poetics (c. 335 BCE)"
            division="Beginning / Middle / End (no prescribed percentages)"
          >
            <p>
              <strong>The foundation.</strong> Aristotle defined: &ldquo;A beginning is that which is not a necessary consequent of anything else&hellip; A middle follows something and something follows from it&hellip; An end follows from something but nothing follows from it.&rdquo; He prescribed no percentages or page counts.
            </p>
          </StructureCard>

          <StructureCard
            id="2b" title="Syd Field's Paradigm"
            source="Syd Field, Screenplay (1979)"
            division="Act 1: Setup (25%) / Act 2: Confrontation (50%) / Act 3: Resolution (25%)"
            symmetric="Asymmetric"
          >
            <p>
              <strong>The dominant Western screenplay framework.</strong> Field codified specific page targets for 120-page screenplays. Added Plot Points at act boundaries (25%, 75%), a Midpoint (50%), and Pinch Points (~37.5%, ~62.5%). The most widely taught model in film schools.
            </p>
            <DataTable
              headers={['Element', 'Position']}
              rows={[
                ['Act 1 (Setup)', '0\u201325%'],
                ['Plot Point 1', '~25%'],
                ['Act 2A (Confrontation)', '25\u201350%'],
                ['Midpoint', '~50%'],
                ['Act 2B (Complications)', '50\u201375%'],
                ['Plot Point 2', '~75%'],
                ['Act 3 (Resolution)', '75\u2013100%'],
              ]}
            />
          </StructureCard>

          <StructureCard
            id="2c" title="Linda Seger's Three-Act Model"
            source="Linda Seger, Making a Good Script Great (1987)"
            division="Act 1: Setup (~25-29%) / Act 2: Confrontation (~46-50%) / Act 3: Resolution (~21-25%)"
            symmetric="Asymmetric"
          >
            <p>
              <strong>Emphasizes turning points as the structural engine.</strong> Seger&rsquo;s turning points &ldquo;turn the action in a new direction, raise the central question again, require a decision or commitment on the part of the main character, raise the stakes, push the story into the next act, and take the audience into a new arena.&rdquo; Her act breaks are slightly more flexible than Field&rsquo;s rigid page counts.
            </p>
          </StructureCard>

          <StructureCard
            id="2d" title="Blake Snyder's Thesis / Antithesis / Synthesis"
            source="Blake Snyder, Save the Cat! (2005)"
            division="Act 1: Thesis (20%) / Act 2: Antithesis (55%) / Act 3: Synthesis (25%)"
            symmetric="Asymmetric"
          >
            <p>
              <strong>Frames acts as dialectic.</strong> Act 1 is the &ldquo;thesis world&rdquo; (status quo). Act 2 is the &ldquo;antithesis&rdquo; &mdash; an upside-down version where the rules have changed. Act 3 is the &ldquo;synthesis&rdquo; &mdash; the hero integrates what they&rsquo;ve learned. 15 precisely placed beats within. Act breaks at 20% and 75% (slightly different from Field&rsquo;s 25/75).
            </p>
          </StructureCard>

          <StructureCard
            id="2e" title="Robert McKee's Design"
            source="Robert McKee, Story (1997)"
            division="Flexible &mdash; McKee doesn't prescribe fixed percentages"
          >
            <p>
              <strong>McKee argues story is &ldquo;a design in five parts&rdquo;:</strong> Inciting Incident, Progressive Complications, Crisis, Climax, Resolution. He works within acts but emphasizes that act count is less important than the internal design of scenes and sequences. He places the &ldquo;Archplot&rdquo; (classical design) at the top of his &ldquo;story triangle,&rdquo; with Miniplot and Antiplot at the other points.
            </p>
          </StructureCard>

          <StructureCard
            id="2f" title="Lajos Egri's Premise-Driven Structure"
            source="Lajos Egri, The Art of Dramatic Writing (1942)"
            division="Thesis / Antithesis / Synthesis (derived from premise)"
          >
            <p>
              <strong>Structure grows from the premise.</strong> Egri argues every good play proves a premise (e.g., &ldquo;ruthless ambition leads to destruction&rdquo;). The three acts correspond to: thesis (establishing the premise), antithesis (opposition to it), synthesis (resolution/proof). Character is the engine &mdash; structure follows character need, not external formulas.
            </p>
          </StructureCard>

          <StructureCard
            id="2g" title="TV Network Drama Three-Act (Streaming)"
            source="Modern streaming television (Netflix, HBO, Apple TV+)"
            division="Act 1 (~25%) / Act 2 (~50%) / Act 3 (~25%)"
          >
            <p>
              <strong>No commercial breaks.</strong> Streaming dramas often use three-act structure internally without explicit act breaks on the page. The structure is present but invisible, allowing for flexible episode lengths (40-75 minutes).
            </p>
          </StructureCard>

          <StructureCard
            id="2h" title="Jo-ha-ky\u016B (as 3-Phase Framework)"
            source="Zeami Motokiyo, Noh theater (14th-15th century Japan)"
            division="Jo: slow beginning (~20%) / Ha: breaking/development (~60%) / Ky\u016B: rapid conclusion (~20%)"
            symmetric="Asymmetric"
          >
            <p>
              <strong>A pacing framework, not just act structure.</strong> Jo (序) = &ldquo;beginning,&rdquo; slow and deliberate introduction. Ha (破) = &ldquo;breaking,&rdquo; development accelerates. Ky&ucirc; (急) = &ldquo;rapid,&rdquo; swift conclusion. Applied fractally: to the choice of plays across a day, to acts within a play, to scenes within an act, down to individual gestures. Influences all traditional Japanese performing arts (Noh, Kabuki, J&omacr;ruri).
            </p>
          </StructureCard>
        </div>
      </Section>

      {/* ===== PART 3: FOUR-ACT ===== */}
      <Section title="Part 3: Four-Act Structures">
        <div className="space-y-2">
          <StructureCard
            id="3a" title="Kishotenketsu (起承転結)"
            source="Chinese classical poetry; adopted in Japanese and Korean traditions"
            division="Ki: Introduction (~15%) / Sh\u014D: Development (~45%) / Ten: Twist (~30%) / Ketsu: Reconciliation (~10%)"
            symmetric="Asymmetric"
            genres="Literary fiction, slice-of-life, manga/anime, East Asian traditions, game design"
          >
            <p>
              <strong>No conflict requirement.</strong> The &ldquo;Ten&rdquo; (twist) is a juxtaposition or recontextualization, not a conflict escalation. The drama comes from the unexpected shift in perspective, not from antagonism.
            </p>
            <DataTable
              headers={['Act', 'Japanese', 'Function']}
              rows={[
                ['Ki (起)', 'Introduction', 'Establish characters and setting'],
                ['Sh\u014D (承)', 'Development', 'Deepen understanding \u2014 no conflict required'],
                ['Ten (転)', 'Twist', 'Unexpected change or perspective shift'],
                ['Ketsu (結)', 'Reconciliation', 'Harmonize earlier acts with the twist'],
              ]}
            />
          </StructureCard>

          <StructureCard
            id="3b" title="Western Four-Act / Split Act Two"
            source="Various (popularized by screenwriting blogs, 2010s)"
            division="Act 1: Setup (25%) / Act 2: Reaction (25%) / Act 3: Action (25%) / Act 4: Resolution (25%)"
            symmetric="Symmetric"
          >
            <p>
              <strong>Explicitly splits the &ldquo;sagging middle&rdquo; of the three-act structure.</strong> Act 2 = the protagonist reacts to the inciting incident. Act 3 = the protagonist takes active control. The midpoint is the explicit boundary between reaction and action.
            </p>
          </StructureCard>

          <StructureCard
            id="3c" title="Kristin Thompson's Four-Part Structure"
            source="Kristin Thompson, Storytelling in the New Hollywood (1999)"
            division="Setup (~25%) / Complicating Action (~25%) / Development (~25%) / Climax + Epilogue (~25%)"
            symmetric="Roughly"
          >
            <p>
              <strong>Academic analysis, not a prescriptive formula.</strong> Thompson demonstrated through empirical analysis of Hollywood films that most actually have four large-scale parts with major turning points providing the transitions, not three. The midpoint turn is as structurally significant as the act breaks.
            </p>
          </StructureCard>

          <StructureCard
            id="3d" title="TV Network Four-Act (Hour Drama)"
            source="Network television format (ABC, CBS, NBC through 2000s)"
            division="Teaser (2-5%) + Act 1 (~23%) / Act 2 (~25%) / Act 3 (~25%) / Act 4 (~22%)"
            symmetric="Roughly"
          >
            <p>
              <strong>Dictated by commercial breaks.</strong> Three commercial breaks create four acts. Each act ends with a cliffhanger or revelation to retain viewers through the break. Acts typically 10-15 pages each. The teaser (cold open) hooks the audience before the first break.
            </p>
          </StructureCard>

          <StructureCard
            id="3e" title="NBC Half-Hour Comedy Four-Act"
            source="NBC TV Writers Program guidelines"
            division="Cold Open + Act 1 + Act 2 + Act 3"
          >
            <p>
              <strong>NBC specifies:</strong> &ldquo;All comedy pilots must follow a four-act structure or Cold Open + three-act structure.&rdquo; This creates a distinct 4-part framework for sitcoms on NBC.
            </p>
          </StructureCard>

          <StructureCard
            id="3f" title="W-Plot (as 4-Part Structure)"
            source="Mary Carroll Moore, Your Book Starts Here (2011)"
            division="Part 1 (0-25%) / Part 2 (25-50%) / Part 3 (50-75%) / Part 4 (75-100%)"
            symmetric="Symmetric"
          >
            <p>
              <strong>Defined by 5 emotional turning points forming a W-shape.</strong> Trigger (drops) &rarr; First Turn (rises) &rarr; Midpoint Trigger (drops) &rarr; Second Turn (rises) &rarr; Resolution. Used for character-driven, emotional, and romance narratives.
            </p>
            <pre className="text-[10px] text-purple-300 bg-slate-900/60 p-2 rounded mt-1 font-mono leading-tight">
{`Hope  ^     /\\          /\\
      |    /  \\        /  \\
      |   /    \\      /    \\
      |  /      \\    /      \\
Low   | /        \\  /        \\
      |/          \\/          \\
       0%   25%   50%   75%  100%`}
            </pre>
          </StructureCard>
        </div>
      </Section>

      {/* ===== PART 4: FIVE-ACT ===== */}
      <Section title="Part 4: Five-Act Structures">
        <div className="space-y-2">
          <StructureCard
            id="4a" title="Freytag's Pyramid"
            source="Gustav Freytag, Die Technik des Dramas (1863)"
            division="Exposition (20%) / Rising Action (20%) / Climax (20%) / Falling Action (20%) / Denouement (20%)"
            symmetric="Symmetric"
            genres="Classical drama, tragedy, Shakespeare analysis, literary fiction"
          >
            <p>
              <strong>Climax at midpoint (50%)</strong>, not at 75-90% as in three-act. The second half is about consequences and downfall. Designed from analysis of Greek and Shakespearean plays.
            </p>
            <DataTable
              headers={['Act', 'Name', 'Position']}
              rows={[
                ['Act 1', 'Exposition', '0\u201320%'],
                ['Act 2', 'Rising Action', '20\u201340%'],
                ['Act 3', 'Climax', '40\u201360%'],
                ['Act 4', 'Falling Action', '60\u201380%'],
                ['Act 5', 'Denouement', '80\u2013100%'],
              ]}
            />
          </StructureCard>

          <StructureCard
            id="4b" title="Shakespeare's Five-Act (Practice vs Freytag's Theory)"
            source="William Shakespeare's plays; analyzed by various scholars"
            division="Variable &mdash; NOT the equal 20/20/20/20/20 of Freytag"
            symmetric="Asymmetric"
          >
            <p>
              <strong>Shakespeare&rsquo;s actual practice differs from Freytag&rsquo;s idealized model.</strong> The climax often falls in Act 3, but act lengths vary considerably. Some plays front-load exposition, others have extended falling action. The five-act format was a convention of Elizabethan and Jacobean theater, inherited from Roman dramatist Seneca.
            </p>
          </StructureCard>

          <StructureCard
            id="4c" title="Natyashastra's Five Stages (Avastha)"
            source="Bharata Muni, Natyashastra (c. 200 BCE \u2013 200 CE, India)"
            division="Arambha / Yatna / Pr\u0101pti / Niyat\u0101pti / Phala"
            symmetric="Asymmetric"
          >
            <p>
              <strong>The oldest surviving dramatic theory.</strong> Five stages (avastha) viewed from the hero&rsquo;s perspective:
            </p>
            <DataTable
              headers={['Stage', 'Sanskrit', 'Meaning']}
              rows={[
                ['1', '\u0100rambha', 'Beginning \u2014 the seed of purpose is planted'],
                ['2', 'Yatna', 'Effort \u2014 the hero strives toward the goal'],
                ['3', 'Pr\u0101pty\u0101\u015B\u0101 (Pr\u0101pti)', 'Hope of attainment \u2014 possibility emerges'],
                ['4', 'Niyat\u0101pti', 'Certainty of attainment \u2014 obstacles overcome'],
                ['5', 'Phal\u0101gama (Phala)', 'Fruition \u2014 the result is achieved'],
              ]}
            />
            <p className="mt-1">
              Parallel to this, five <em>samdhis</em> (junctures) provide the structural joints: Mukha (opening), Pratimukha (progression), Garbha (development), Avamarsha (pause/crisis), Nirvahana (conclusion). The Natyashastra also defines Rasa theory (9 emotional flavors), making it both a structural and emotional framework.
            </p>
          </StructureCard>

          <StructureCard
            id="4d" title="Jo-ha-ky\u016B as Five-Dan (Zeami's Noh)"
            source="Zeami Motokiyo, F\u016Bshikaden (early 15th century)"
            division="Dan 1 (Jo, ~20%) / Dan 2 (Ha-1, ~20%) / Dan 3 (Ha-2, ~20%) / Dan 4 (Ha-3, ~20%) / Dan 5 (Ky\u016B, ~20%)"
            symmetric="Roughly"
          >
            <p>
              <strong>Zeami&rsquo;s ideal Noh play has 5 dan (sections):</strong> Dan 1 = Jo (slow, auspicious beginning). Dan 2-4 = Ha (builds drama; climax in Dan 3). Dan 5 = Ky&ucirc; (rapid return to peace). This also governs the selection of 5 plays in a full day&rsquo;s Noh program, creating a fractal structure.
            </p>
          </StructureCard>

          <StructureCard
            id="4e" title="McKee's Five-Part Design"
            source="Robert McKee, Story (1997)"
            division="Inciting Incident (~10%) / Progressive Complications (~50%) / Crisis (~10%) / Climax (~20%) / Resolution (~10%)"
            symmetric="Asymmetric"
          >
            <p>
              <strong>McKee views story as five interconnected parts</strong>, not three rigid acts. The Inciting Incident upsets equilibrium. Progressive Complications generate escalating conflict. Crisis is the ultimate decision. Climax is &ldquo;your great imaginative leap.&rdquo; Resolution restores balance.
            </p>
          </StructureCard>

          <StructureCard
            id="4f" title="TV Network Drama Five-Act"
            source="Network television format (NBC, late 2000s onward)"
            division="Teaser + Act 1 + Act 2 + Act 3 + Act 4 + Act 5"
          >
            <p>
              <strong>NBC specifies drama pilots must &ldquo;follow either a six-act structure or Cold Open + 5 act structure.&rdquo;</strong> More commercial breaks than the older 4-act format, creating shorter acts of approximately 8-10 pages each.
            </p>
          </StructureCard>
        </div>
      </Section>

      {/* ===== PART 5: SIX-ACT ===== */}
      <Section title="Part 5: Six-Act Structures">
        <div className="space-y-2">
          <StructureCard
            id="5a" title="Michael Hauge's Six-Stage Structure"
            source="Michael Hauge, Writing Screenplays That Sell (1988)"
            division="Setup (0-10%) / New Situation (10-25%) / Progress (25-50%) / Complications (50-75%) / Final Push (75-90%) / Aftermath (90-100%)"
            symmetric="Asymmetric"
            genres="Character-driven stories, love stories, screenwriting"
          >
            <DataTable
              headers={['Stage', 'Position', 'Outer Journey', 'Inner Journey']}
              rows={[
                ['I: Setup', '0\u201310%', 'Everyday life', 'Living in identity'],
                ['II: New Situation', '10\u201325%', 'Reacting to change', 'Glimpse of essence'],
                ['III: Progress', '25\u201350%', 'Plan seems to work', 'Moving toward essence'],
                ['IV: Complications', '50\u201375%', 'Goal gets harder', 'Fear of essence grows'],
                ['V: Final Push', '75\u201390%', 'Risks everything', 'Living one\'s truth'],
                ['VI: Aftermath', '90\u2013100%', 'New life revealed', 'Transformation complete'],
              ]}
            />
            <p>
              <strong>Unique dual-track:</strong> Every stage has both an outer (plot) and inner (identity-to-essence) journey. Five turning points between stages at ~10%, ~25%, ~50%, ~75%, ~90%.
            </p>
          </StructureCard>

          <StructureCard
            id="5b" title="TV Network Drama Six-Act (NBC Format)"
            source="NBC TV Writers Program guidelines"
            division="Cold Open + 5 Acts (effectively 6 segments)"
          >
            <p>
              <strong>The current NBC standard for drama pilots.</strong> Five commercial breaks create six viewing segments. Each ends on a dramatic beat to retain audience through breaks.
            </p>
          </StructureCard>
        </div>
      </Section>

      {/* ===== PART 6: EIGHT-ACT ===== */}
      <Section title="Part 6: Eight-Act / Sequence Structures">
        <div className="space-y-2">
          <StructureCard
            id="6a" title="Eight-Sequence Structure (Frank Daniel)"
            source="Frank Daniel, USC School of Cinematic Arts (1960s-1980s)"
            division="8 sequences of ~12.5% each, nested within 3 acts"
            symmetric="Approximately"
            genres="Screenwriting (USC, Columbia, Chapman)"
          >
            <DataTable
              headers={['Seq', 'Act', 'Function']}
              rows={[
                ['1', 'Act 1', 'Status quo, inciting incident'],
                ['2', 'Act 1', 'Debate/commitment, Plot Point 1'],
                ['3', 'Act 2A', 'First attempt at solving problem'],
                ['4', 'Act 2A', 'Midpoint culmination'],
                ['5', 'Act 2B', 'Escalation, new approach'],
                ['6', 'Act 2B', 'Plot Point 2'],
                ['7', 'Act 3', 'Climax'],
                ['8', 'Act 3', 'Resolution and coda'],
              ]}
            />
            <p>Each sequence is a &ldquo;mini-movie&rdquo; with its own compressed goal, conflict, and partial resolution.</p>
          </StructureCard>

          <StructureCard
            id="6b" title="Paul Gulino's Sequence Approach"
            source="Paul Gulino, Screenwriting: The Sequence Approach (2004)"
            division="Flexible &mdash; not always 8 sequences"
          >
            <p>
              <strong>Gulino&rsquo;s refinement of Daniel&rsquo;s model.</strong> Through analysis of classic films, he demonstrates that the number of sequences varies. The key insight is that sequences have conflicts that are only partly resolved, engaging attention through the gap between what the audience wants and what they get.
            </p>
          </StructureCard>
        </div>
      </Section>

      {/* ===== PART 7: NON-NUMBERED ===== */}
      <Section title="Part 7: Non-Numbered / Alternative Structural Frameworks">
        <div className="space-y-2">
          <StructureCard
            id="7a" title="Chiastic Structure / Ring Composition"
            source="Ancient literary tradition; Mary Douglas, Thinking in Circles (2007)"
            division="ABCBA or ABCDCBA &mdash; ideas mirror around a central pivot"
          >
            <p>
              <strong>Not act-based.</strong> The story or text is organized as a series of elements that repeat in reverse order around a central axis. The center point is the thematic heart. Whitman found &ldquo;chiastic structure of the most amazing virtuosity&rdquo; in Homer, serving both aesthetic and mnemonic functions.
            </p>
            <p className="mt-1"><strong>Used in:</strong> Homer&rsquo;s <em>Iliad</em> and <em>Odyssey</em>, Hebrew Bible, Quran, Book of Mormon, medieval literature.</p>
          </StructureCard>

          <StructureCard
            id="7b" title="Propp's 31 Functions"
            source="Vladimir Propp, Morphology of the Folktale (1928)"
            division="31 sequential narrative functions, not all present in every tale"
          >
            <p>
              <strong>A syntagmatic model.</strong> Propp identified 31 functions (Absentation, Interdiction, Violation, Reconnaissance, etc.) that occur in fixed sequence in Russian fairy tales. Stories may skip functions but never reorder them. Seven character archetypes (villain, dispatcher, helper, princess/prize, donor, hero, false hero). Influenced L&eacute;vi-Strauss, Barthes, Campbell, and game narrative design.
            </p>
          </StructureCard>

          <StructureCard
            id="7c" title="Campbell's Monomyth (Departure / Initiation / Return)"
            source="Joseph Campbell, The Hero with a Thousand Faces (1949)"
            division="Departure (~25%) / Initiation (~50%) / Return (~25%)"
          >
            <p>
              <strong>17 stages across 3 phases.</strong> More analytical than practical &mdash; Vogler&rsquo;s 12-stage adaptation is what fiction writers use. The circular nature (departure and return) distinguishes it from linear act models.
            </p>
          </StructureCard>

          <StructureCard
            id="7d" title="Rasa Theory"
            source="Bharata Muni, Natyashastra (c. 200 BCE \u2013 200 CE)"
            division="8 (later 9) emotional flavors (rasas)"
          >
            <p>
              <strong>Not structural but emotional.</strong> The nine rasas are: &#346;&#7771;&#7749;g&#257;ra (love/beauty), H&#257;sya (laughter), Karu&#7751;a (sorrow), Raudra (anger), V&#299;ra (heroism), Bhay&#257;naka (terror), B&#299;bhatsa (disgust), Adbhuta (wonder), and &#346;&#257;nta (peace/serenity). A drama is organized to evoke specific rasas in sequence, with one dominant rasa governing the whole work.
            </p>
          </StructureCard>

          <StructureCard
            id="7e" title="Spiral Structure"
            source="Various &mdash; literary fiction, TV series, philosophical narratives"
            division="Themes and situations return at progressively higher levels"
          >
            <p>
              <strong>The protagonist encounters similar challenges repeatedly, but each return deepens understanding.</strong> Unlike circular structure (which returns to the same point), spiral structure moves upward. Common in bildungsroman, serial television, and philosophical fiction.
            </p>
          </StructureCard>

          <StructureCard
            id="7f" title="Parallel / Braided Structure"
            source="Various &mdash; ensemble fiction, multi-POV narratives"
            division="Multiple storylines running simultaneously, intersecting at key points"
          >
            <p>
              <strong>No single act structure governs the whole.</strong> Each storyline may have its own internal act structure. The structural challenge is synchronization &mdash; when and how the storylines converge. Examples: <em>Cloud Atlas</em>, <em>Game of Thrones</em>, Tarantino films.
            </p>
          </StructureCard>

          <StructureCard
            id="7g" title="Mosaic / Non-Linear Structure"
            source="Modernist and postmodernist fiction"
            division="Fragmented scenes assembled into meaning"
          >
            <p>
              <strong>Rejects linear chronology.</strong> Scenes may be out of order, from different time periods, or from different perspectives. The &ldquo;structure&rdquo; is the pattern the audience discovers. Examples: <em>Pulp Fiction</em>, <em>Memento</em>, <em>Slaughterhouse-Five</em>.
            </p>
          </StructureCard>

          <StructureCard
            id="7h" title="In Medias Res as Structural Choice"
            source="Horace, Ars Poetica (c. 19 BCE)"
            division="Story begins in the chronological middle"
          >
            <p>
              <strong>Not a replacement for act structure</strong> &mdash; combinable with any framework. But some frameworks are built around it: the Fichtean Curve essentially codifies in medias res as its defining structural feature.
            </p>
          </StructureCard>
        </div>
      </Section>

      {/* ===== PART 8: CLASSIFICATION SUMMARY ===== */}
      <Section title="Part 8: Classification Summary">
        <h4 className="font-semibold text-white text-sm mb-2">By Act Count</h4>
        <DataTable
          headers={['# Acts', 'Frameworks']}
          rows={[
            ['2', "Aristotle's Complication/Denouement, Fichtean Curve, Rise-and-Fall, Musical Two-Act, TV Sitcom Two-Act"],
            ['3', "Aristotle's B/M/E, Syd Field, Linda Seger, Snyder (Thesis/Antithesis/Synthesis), McKee, Egri, Jo-ha-ky\u016B (3-phase), TV Streaming Drama"],
            ['4', "Kishotenketsu, Western Split-Act-2, Kristin Thompson, TV Network 4-Act, NBC Comedy 4-Act, W-Plot"],
            ['5', "Freytag's Pyramid, Shakespeare's 5-Act, Natyashastra (Avastha), Zeami's 5-Dan (Jo-ha-ky\u016B), McKee's 5-Part, TV Network Drama 5-Act"],
            ['6', "Michael Hauge's 6-Stage, NBC Drama 6-Act"],
            ['8', "Eight-Sequence (Frank Daniel), Gulino's Sequence Approach"],
            ['Non-numbered', "Chiasmus/Ring, Propp's 31 Functions, Monomyth, Rasa Theory, Spiral, Parallel/Braided, Mosaic/Non-Linear"],
          ]}
        />

        <h4 className="font-semibold text-white text-sm mb-2 mt-4">By Symmetry</h4>
        <DataTable
          headers={['Type', 'Frameworks']}
          rows={[
            ['Symmetric', 'Freytag (20/20/20/20/20), Western 4-Act (25/25/25/25), Rise-and-Fall (50/50)'],
            ['Roughly symmetric', 'Thompson 4-Part, Eight-Sequence, Zeami 5-Dan, Musical Two-Act'],
            ['Asymmetric', 'Syd Field (25/50/25), Snyder (20/55/25), Kishotenketsu (15/45/30/10), Fichtean (70/30), Hauge (variable), Natyashastra'],
          ]}
        />

        <h4 className="font-semibold text-white text-sm mb-2 mt-4">By Tradition</h4>
        <DataTable
          headers={['Tradition', 'Frameworks']}
          rows={[
            ['Western Classical', 'Aristotle, Freytag, Shakespeare 5-Act'],
            ['Hollywood', 'Syd Field, Snyder, Seger, McKee, Thompson, Eight-Sequence, Gulino'],
            ['Television', '2-Act Sitcom, 4-Act Network Drama, 5-Act Network Drama, 6-Act NBC, Streaming 3-Act'],
            ['East Asian', 'Kishotenketsu (China/Japan/Korea), Jo-ha-ky\u016B (Japan)'],
            ['Indian', 'Natyashastra (Avastha + Samdhi + Rasa)'],
            ['Theater', 'Musical Two-Act, Shakespeare 5-Act, Noh 5-Dan'],
            ['Folklore/Myth', "Propp's 31 Functions, Campbell's Monomyth"],
            ['Character-driven', 'Egri (premise), Hauge (dual-track), W-Plot (emotional), Truby (organic)'],
            ['Structural experiment', 'Chiasmus, Spiral, Parallel/Braided, Mosaic/Non-Linear'],
          ]}
        />
      </Section>

      {/* ===== PART 9: WHAT NPE IMPLEMENTS ===== */}
      <Section title="Part 9: What NPE Currently Implements">
        <p className="text-xs text-purple-300 mb-3">
          The Narrative Context Graph implements 15 structures. Each has both beat definitions (named story moments with time ranges) and optional act definitions (macro divisions with percentage ranges).
        </p>

        <h4 className="font-semibold text-white text-sm mb-2">Act Structures (7 in &ldquo;act&rdquo; selector)</h4>
        <DataTable
          headers={['NPE Key', 'Name', '# Acts', 'Distribution']}
          rows={[
            ['sydFieldParadigm', 'Syd Field Paradigm', '3', '25/50/25'],
            ['kishotenketsu', 'Kishotenketsu', '4', '15/45/30/10'],
            ['freytagPyramid', "Freytag's Pyramid", '5', '20/20/20/20/20'],
            ['eightSequence', 'Eight-Sequence', '3 (8 seq)', '~12.5% each'],
            ['haugeSixStage', "Hauge's Six-Stage", '6', 'Variable'],
            ['wPlot', 'W-Plot', '4', '~25/25/25/25'],
            ['fichteanCurve', 'Fichtean Curve', '2', '70/30'],
          ]}
        />

        <h4 className="font-semibold text-white text-sm mb-2 mt-4">Beat Structures (4 in &ldquo;beat&rdquo; selector)</h4>
        <DataTable
          headers={['NPE Key', 'Name', '# Beats', 'Has Acts?']}
          rows={[
            ['saveTheCat', 'Save the Cat', '15', 'Yes (3)'],
            ['truby22', "Truby's 22 Steps", '22', 'No (rejects acts)'],
            ['storyCircle', 'Story Circle', '8', 'Yes (4)'],
            ['sevenPoint', 'Seven-Point', '7', 'Yes (2)'],
          ]}
        />

        <h4 className="font-semibold text-white text-sm mb-2 mt-4">Dual-Purpose Structures (4 in both selectors)</h4>
        <DataTable
          headers={['NPE Key', 'Name', '# Beats', '# Acts']}
          rows={[
            ['romancingTheBeat', 'Romancing the Beat', '10', '4'],
            ['heroJourney', "Hero's Journey", '12', '3'],
            ['threeAct', 'Three Act Structure', '9', '3'],
            ['mysterySuspense', 'Mystery/Suspense', '11', '3'],
          ]}
        />
      </Section>

      {/* ===== PART 10: CANDIDATES ===== */}
      <Section title="Part 10: Structures Not Yet in NPE (Candidates for Addition)">
        <h4 className="font-semibold text-white text-sm mb-2">High-Priority Act Structures</h4>
        <ul className="list-disc list-inside space-y-1 text-xs text-purple-200">
          <li><strong>Western Four-Act / Split Act Two</strong> (Setup/Reaction/Action/Resolution, 25/25/25/25) &mdash; the most commonly discussed 4-act model outside Kishotenketsu</li>
          <li><strong>Kristin Thompson&rsquo;s Four-Part</strong> &mdash; academically validated through film analysis</li>
          <li><strong>Natyashastra Five-Stage</strong> &mdash; oldest dramatic theory, unique non-Western perspective</li>
          <li><strong>Jo-ha-ky&ucirc;</strong> (as 3-phase or 5-dan) &mdash; fractal pacing framework from Noh</li>
          <li><strong>Shakespearean Rise-and-Fall</strong> (2-act) &mdash; useful for tragedy and crime narratives</li>
          <li><strong>TV 5-Act / 6-Act</strong> &mdash; practical for authors writing for screen adaptation</li>
        </ul>

        <h4 className="font-semibold text-white text-sm mb-2 mt-4">Lower-Priority / Specialized</h4>
        <ul className="list-disc list-inside space-y-1 text-xs text-purple-200">
          <li><strong>Aristotle&rsquo;s original 2-part Complication/Denouement</strong> &mdash; historical, subsumed by later models</li>
          <li><strong>Musical Two-Act</strong> &mdash; theater-specific</li>
          <li><strong>NBC Comedy 4-Act</strong> &mdash; TV-specific</li>
        </ul>

        <h4 className="font-semibold text-white text-sm mb-2 mt-4">Beat Structures (candidates)</h4>
        <ul className="list-disc list-inside space-y-1 text-xs text-purple-200">
          <li><strong>Campbell&rsquo;s 17-Stage Monomyth</strong> &mdash; more detailed than Vogler&rsquo;s 12</li>
          <li><strong>Propp&rsquo;s 31 Functions</strong> &mdash; folklore/fairy tale specific</li>
        </ul>
      </Section>

      {/* ===== SOURCES ===== */}
      <Section title="Sources">
        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-purple-300">
          <li>Reedsy: Story Structure Types</li>
          <li>The Novel Smithy: Four Act Structure</li>
          <li>MasterClass: Three-Act Structure / Five-Act Structure</li>
          <li>Greenlight Coverage: TV Drama Act Structure</li>
          <li>The Script Lab: TV Script Structure</li>
          <li>Screenplayology: Alternative &amp; Classical Screenplay Structure</li>
          <li>Wikipedia: Kishotenketsu, Jo-ha-ky&ucirc;, Natya Shastra, Chiastic Structure, Vladimir Propp, Three-act structure</li>
          <li>The Story Department: 2-Act Structure, Sequence Approach</li>
          <li>TV Tropes: Two-Act Structure</li>
          <li>Harvard University Press: Kristin Thompson, Storytelling in the New Hollywood</li>
          <li>Roger Ebert / Scanners: Acts</li>
          <li>Final Draft: TV Pilot Structure</li>
          <li>Alice Sudlow: Three-Act or Four-Act</li>
          <li>Prewrite: Beginner&rsquo;s Guide to Four Act Structure</li>
        </ul>
      </Section>
    </div>
  );
}
