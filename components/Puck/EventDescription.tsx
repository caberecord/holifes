'use client';

interface EventDescriptionProps {
    title?: string;
    content: string;
    alignment: "left" | "center" | "right";
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export function EventDescription({
    title,
    content,
    alignment,
    backgroundColor,
    textColor,
    fontFamily = "inter"
}: EventDescriptionProps) {
    const alignmentClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[alignment];

    const fontClass = {
        inter: 'font-inter',
        montserrat: 'font-montserrat',
        playfair: 'font-playfair',
        oswald: 'font-oswald',
        poppins: 'font-poppins',
        merriweather: 'font-merriweather',
        anton: 'font-anton',
        cormorant: 'font-cormorant',
        lilita: 'font-lilita',
        space: 'font-space',
        harlow: 'font-harlow',
        curlz: 'font-curlz',
        baguet: 'font-baguet',
        cascadia: 'font-cascadia',
        varsity: 'font-varsity',
        freshman: 'font-freshman',
        // Fallbacks
        modern: 'font-inter',
        bold: 'font-anton',
        retro: 'font-space',
    }[fontFamily] || 'font-inter';

    return (
        <section
            className={`py-16 px-4 ${fontClass}`}
            style={{
                backgroundColor: backgroundColor || 'white',
                color: textColor || '#111827'
            }}
        >
            <div className="max-w-4xl mx-auto">
                {title && (
                    <h2
                        className={`text-3xl font-bold mb-8 ${alignmentClass}`}
                        style={{ color: textColor || '#111827' }}
                    >
                        {title}
                    </h2>
                )}
                <div
                    className={`prose prose-lg max-w-none ${alignmentClass}`}
                    style={{ color: textColor || '#374151' }}
                    dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
                />
            </div>
        </section>
    );
}
