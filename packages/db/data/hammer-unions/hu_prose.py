"""
Per-figure prose facts.

Every entry here is traceable to a sentence in one of the two catalogues, and
the page is named. The wording is ours - the facts are theirs. Nothing states
a temperature range, a material grade, a test regime, a certificate or a lead
time, because neither book states one, and the pages this replaces invented
all five.

`seal`, `material` and `seat` are omitted rather than filled where the source
is silent. That absence is the point: an empty field is a question for the
supplier, a plausible one is a defect nobody can see.
"""

# summary   - one sentence saying what the figure is, from the source page
# service   - what the source says it is for
# features  - sourced bullets, our wording
# seal      - the sealing arrangement, where a source names one
# material  - construction, where a source names one
# seat      - seat material, where a source names one
# interchange - interchangeability claim, only where a source makes one
# caution   - a warning the source itself raises

FIG_PROSE = {
    '50': dict(
        summary='The Figure 50 is the suction and low-pressure union in the hammer lug family, '
                'built in steel throughout and available with threaded or socket weld ends in '
                '4 in and 5 in.',
        service='Suction lines and low-pressure line connections.',
        features=[
            'Steel construction throughout, threaded or socket weld ends.',
            'One nut and one O-ring serve both the 4 in and the 5 in size.',
            'Male and female blanking caps are available for the same connection.',
        ],
        seal='O-ring.',
        material='Steel.',
        naming='The figure number is the rating: Figure 50 is designed to hold 500 psi cold '
               'working pressure.',
        source='Marlia p2',
    ),
    '100': dict(
        summary='The Figure 100 is a low-pressure general purpose threaded union for air, water, '
                'oil or gas service.',
        service='General purpose low-pressure line connections and manifolds.',
        features=[
            'Made from steel rather than cast iron, which cuts weight and outside dimensions '
            'without giving up interchangeability with other leading brands.',
            'Threaded ends, 2 in through 8 in.',
        ],
        material='Steel, not cast iron.',
        interchange='Interchangeable with other leading brands of Figure 100 union.',
        naming='Figure 100 takes its name from its ability to withstand 1,000 psi cold working '
               'pressure.',
        source='Marlia p3',
    ),
    '200': dict(
        summary='The Figure 200 is a compact, economical all-steel union covering a wide range of '
                'service up to and including 2,000 psi.',
        service='Line connections and manifolds in the 2,000 psi class.',
        features=[
            'All-steel construction.',
            'Available with threaded and butt weld ends.',
            'Metal-to-metal ball and cone seat.',
        ],
        seal='Metal-to-metal ball and cone seat.',
        material='All steel.',
        source='Marlia p4-p5',
    ),
    '206': dict(
        summary='The Figure 206 is the Figure 200 with a secondary seal added to supplement the '
                'metal-to-metal ball and cone seat.',
        service='Line connections and manifolds in the 2,000 psi class where a secondary seal is '
                'wanted behind the metal seat.',
        features=[
            'Secondary seal supplementing the metal-to-metal ball and cone seat.',
            'Every dimension and weight matches the Figure 200 range.',
            'Available with threaded and butt weld ends.',
        ],
        seal='Metal-to-metal ball and cone seat with a secondary seal.',
        interchange='Dimensionally identical to the Figure 200 range.',
        source='Marlia p6',
    ),
    '207': dict(
        summary='The Figure 207 is a blanking cap for closing off the end of a line, fully '
                'interchangeable with Figure 200 and Figure 206 unions.',
        service='Blanking off the end of a line; capping manifold connections.',
        features=[
            'Fully interchangeable with Figure 200 and Figure 206 unions.',
            'Fitted with an O-ring for a leak-proof seal.',
            'Available with threaded and butt weld ends.',
        ],
        seal='O-ring.',
        interchange='Interchangeable with Figure 200 and Figure 206 unions.',
        source='Marlia p7',
    ),
    '211': dict(
        summary='The Figure 211 is an insulated union for systems where static or electrolytic '
                'corrosion is a problem.',
        service='Lines where static or electrolytic corrosion has to be broken.',
        features=[
            'Insulated design that removes metal-to-metal contact across the union.',
            'Two abrasion-resistant precision elastomers carry the seal.',
        ],
        seal='Dual abrasion-resistant precision elastomers.',
        source='SPM p1',
    ),
    '300': dict(
        summary='The Figure 300 is a flat-face O-ring union that lets a short rigid pipe section '
                'be broken out sideways.',
        service='Breaking out short pipe segments; low or high pressure vapour or liquid service.',
        features=[
            'Flat-face O-ring sealing that permits a lateral breakout of a short rigid pipe run.',
            'Seals equally in low and high pressure vapour or liquid service.',
        ],
        seal='Flat-face O-ring.',
        source='SPM p1',
    ),
    '400': dict(
        summary='The Figure 400 is a heavy ball-and-cone union for manifold connections, suction '
                'lines and mud systems.',
        service='Manifold connections, suction lines and mud systems.',
        features=[
            'Ball and cone sealing, which makes the union easy to align and dependable to seal.',
            'Heavy steel forgings.',
        ],
        seal='Metal-to-metal ball and cone seat.',
        material='Steel forgings.',
        caution='The 5 in, 6 in, 10 in and 12 in sizes are NOT rated at 4,000 psi. They are '
                'reduced to 2,500 psi (172 bar) cold working pressure. The size table below '
                'states the rating for every size — read it before you specify a large Figure '
                '400.',
        source='SPM p1-p2',
    ),
    '600': dict(
        summary='The Figure 600 is a bronze-seated union built for steam service and for lines '
                'where rust, corrosion and condensation attack a metal-to-metal seal.',
        service='Steam service; production and service systems where boiler water or steam seat '
                'corrosion is a problem.',
        features=[
            'Bronze seat insert, which puts a hardness difference across the seats and helps them '
            'seal.',
            'Designed for lines where a metal-to-metal seal is wanted but condensation is a '
            'problem.',
            'Threaded ends.',
        ],
        seal='Metal-to-metal, on a bronze seat insert.',
        seat='Bronze insert.',
        source='Marlia p8, SPM p1',
    ),
    '602': dict(
        summary='The Figure 602 is the 6,000 psi union for line connections, manifolds, mud and '
                'service systems, available with threaded and butt weld ends.',
        service='Line connections, manifolds, mud and service systems at 6,000 psi.',
        features=[
            'Resilient nitrile seal ring that assists the seal and protects the steel-to-steel '
            'seating of the union.',
            'Available with threaded and butt weld ends.',
            'Available in different materials to suit well testing company specifications.',
        ],
        seal='Nitrile seal ring over steel-to-steel seating.',
        source='Marlia p9-p10, SPM p2',
        buttweld_variants=[
            ('Standard', 'Fully rated union for welding to pipe sections up to Sch XXS, in sour '
                         'gas or standard service trim.'),
            ('602-LC (A350 LF2)', 'Low-carbon type for welding to ASTM A106 Grade B or ASTM A333 '
                                  'Grade 6 tubulars of Sch 80 section. Chosen by well test '
                                  'companies as a low-cost, readily available union for pipework '
                                  'that does not have to work above the pressures set out in API '
                                  'RP 14E, which in turn follows the allowable stress values in '
                                  'ANSI/ASME B31.3. Made in 2 in and 3 in only.'),
            ('602-18', 'Made from low-carbon steel forgings that hold their ductility at high '
                       'strength, so they stay readily weldable. Available in 2 in, 3 in and 4 in '
                       'with pipe sections up to and including Sch XXS. Depending on the wall '
                       'section and the pipe used, this union can be fully rated at 6,000 psi '
                       'cold working pressure.'),
        ],
    ),
    '1002': dict(
        summary='The Figure 1002 is a high-pressure low-alloy steel union carrying a replaceable '
                'elastomer seal ring, used on cementing, acidizing, fracturing and choke lines.',
        service='Cementing, acidizing, fracturing and choke lines.',
        features=[
            'Replaceable elastomer seal ring.',
            'The 1 in through 4 in sizes use lip-type seals; the 5 in and 6 in use O-rings.',
            'The 5 in and 6 in sizes are available with butt weld ends only.',
        ],
        seal='Replaceable elastomer seal ring — lip type from 1 in to 4 in, O-ring at 5 in '
             'and 6 in.',
        material='Low-alloy steel.',
        caution='Working pressure falls with size. The 5 in and 6 in sizes are rated below the '
                'rest of the range in both standard and sour gas service. The size table below '
                'states the rating for every size.',
        source='Marlia p11-p12, SPM p2',
    ),
    '1003': dict(
        summary='The Figure 1003 is a misaligning union for high-pressure water, oil, mud or gas '
                'service where the pipe will not line up.',
        service='High-pressure water, oil, mud or gas service where pipe alignment is a problem.',
        features=[
            'Takes up to 7.5 degrees of misalignment off the centre line, 15 degrees included. '
            'The 2 in size is the exception, at 3.5 degrees off the centre line and 7 degrees '
            'included.',
            'Available as line pipe threaded or butt weld; the 5 in is butt weld only.',
            'O-ring seal that holds pressure at any position within the misalignment allowance, '
            'over steel-to-steel seating.',
        ],
        seal='O-ring over steel-to-steel seating.',
        caution='Working pressure falls with size, and manufacturers do not agree on the Figure '
                '1003 rating. The ratings below are our supplier\'s published figures; other '
                'manufacturers rate the same figure number lower in standard service. Work to the '
                'rating stamped on the union in front of you.',
        source='Marlia p13, SPM p2',
    ),
    '1004': dict(
        summary='The Figure 1004 is a 5 in and 6 in butt weld union that carries the lip-type '
                'elastomer seals used in the smaller unions instead of the O-ring the 5 in and '
                '6 in Figure 1002 uses.',
        service='High-pressure lines at 5 in and 6 in where a Figure 1002 O-ring union is '
                'difficult to make up square.',
        features=[
            'Lip-type elastomer seals, in place of the O-ring used by the 5 in and 6 in Figure '
            '1002. An O-ring union of that size has to be made up perfectly square or it gives '
            'trouble; the lip seal is what the Figure 1004 exists to fix.',
            'Butt weld ends, 5 in and 6 in.',
            'Available in standard service or sour gas trim.',
        ],
        seal='Lip-type elastomer seal.',
        source='Marlia p14',
    ),
    '1502': dict(
        summary='The Figure 1502 is the most widely used end connection in the hammer union '
                'family, a rugged 15,000 psi union for cementing, fracturing, acidizing and '
                'choke lines.',
        service='Cementing, fracturing, acidizing and choke lines, and anywhere welded or '
                'permanent API tubing thread fittings are called for.',
        features=[
            'Available with line pipe threads or butt weld ends, in standard or sour gas trim.',
            'Replaceable, resilient nitrile seal ring.',
            'Alloy steel body with heavy walls.',
            'The 5 in and 6 in butt weld sizes were introduced for applications needing greater '
            'flow rates at high pressure.',
        ],
        seal='Replaceable nitrile seal ring.',
        material='Alloy steel, heavy wall.',
        source='Marlia p15-p16, SPM p2',
    ),
    '1505': dict(
        summary='The Figure 1505 is a 15,000 psi union built for fracturing service, made in '
                '3 in only, and designed to connect back to existing 3 in Figure 1502 iron.',
        service='Fracturing.',
        features=[
            'Made in 3 in only.',
            'Backward connectable with 3 in Figure 1502 iron, so it goes into an existing spread '
            'without changing the rest of the line.',
            'A thread start marker on the nut removes cross-threading and cuts make-up time.',
            'Improvements in the critical areas of the union significantly extend its life.',
            'Available with butt weld ends.',
        ],
        source='TechnipFMC Weco wing unions p3, p6',
    ),
    '2002': dict(
        summary='The Figure 2002 is a 20,000 psi butt weld union, the highest-rated union in the '
                'range.',
        service='20,000 psi service. Butt weld only.',
        features=[
            'Lip-type elastomer seals with anti-extrusion rings.',
            'Butt weld ends only.',
        ],
        seal='Lip-type elastomer seal with anti-extrusion ring.',
        caution='The 3 in and 4 in Figure 2002 are called 2.5 in and 3 in by some other '
                'manufacturers. Check the bore against the weld prep dimensions in the table '
                'below before ordering.',
        source='Marlia p17',
    ),
    '2202': dict(
        summary='The Figure 2202 is the sour gas union of the 2002 family, rated 15,000 psi and '
                'built to the requirements of NACE.',
        service='Sour gas service at 15,000 psi. Butt weld only.',
        features=[
            'Lip-type elastomer seals with stainless steel anti-extrusion rings, fitted as '
            'standard.',
            'Every H2S service union is examined against the current requirements of NACE, the '
            'National Association of Corrosion Engineers.',
            'Butt weld ends only.',
        ],
        seal='Lip-type elastomer seal with stainless steel anti-extrusion ring.',
        caution='The 3 in and 4 in Figure 2202 are called 2.5 in and 3 in by some other '
                'manufacturers. Check the bore against the weld prep dimensions in the table '
                'below before ordering.',
        source='Marlia p18',
    ),
}

# The catalogue's own standing note, carried on every page that publishes a
# dimension or a weight. It is the source's sentence, not ours.
CONSULT_NOTE = ('Where dimensions and weight are critical, ask us to confirm them against the '
                'build before you order.')

# What a sour gas page says about the service, and what it does not say. The
# only book that describes sour trim in any detail is the Figure 2202 page,
# and it names NACE. No page states a material class, a hardness limit or an
# NACE revision, so none is claimed here.
SOUR_NOTE = ('Sour gas service unions are supplied in H2S trim and are rated below the standard '
             'service union of the same figure number wherever the source publishes a separate '
             'H2S rating. Confirm the service class, the trim and the certification you need on '
             'your enquiry - we quote against the line specification.')


# A shared explainer on how the connection itself works. Generic engineering
# fact about the wing-union form, not a claim about any one figure, and it is
# what a buyer arriving from "what is a hammer union" needs before the table
# means anything. Written once and rendered on every page rather than varied,
# because varying it would be padding.
HOW_IT_MAKES_UP = (
    'A hammer union is a three-piece connection. A male sub and a female sub carry the two line '
    'ends, and a wing nut turns on a thread cut into the male sub and pulls a shoulder on the '
    'female sub down onto the seat. The lugs standing proud of the nut are struck with a hammer '
    'to tighten it, which is where the name comes from — the joint is made up and broken out with '
    'a sledgehammer rather than a wrench, so a line can be rigged and stripped quickly in the '
    'field. The seal is made by the seat, not by the thread: the nut only supplies the load that '
    'holds the two seating faces together. That is why a union will leak from a scored seat or a '
    'perished seal long before the thread is at fault, and why a worn union is usually a sub or a '
    'seal replacement rather than a scrap part.'
)

# What a buyer has to settle before ordering. Every clause points at something
# published on the page — figure, service class, end type, size — rather than
# adding a fact.
SPECIFYING = (
    'Four things fix a hammer union: the figure number, which sets the pressure class and decides '
    'what it will mate with; the service class, standard or sour gas; the end connection, threaded '
    'or butt weld; and the nominal size. Figure numbers are an industry series, so a union of the '
    'same figure and size from another maker will mate — but the pressure rating stamped on the '
    'union is what governs, not the figure number on its own. Send us the line specification and '
    'we will confirm the match before quoting.'
)
