import { Metadata } from "next";
import Link from "next/link";
import ManifestS3Client from "@/s3ApiClient";
import Image from "next/image";

const s3 = new ManifestS3Client();

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}): //parent: ResolvingMetadata
Promise<Metadata> {
    const { slug } = await params;

    const newsItem = await s3.getNewsItemFromLink(slug.join("/"));

    const ogImages = [];

    if (newsItem?.OptionalMobileImagePath) {
        ogImages.push({
            url: newsItem.OptionalMobileImagePath,
            width: 570,
            height: 286,
        });
    } else {
        if (newsItem?.ImagePath) {
            ogImages.push({
                url: newsItem.ImagePath,
                width: 1920,
                height: 590,
            });
        }
    }

    return {
        title: newsItem?.Title,
        description: newsItem?.Description,
        openGraph: {
            title: newsItem?.Title,
            releaseDate: newsItem?.PubDate.toString(),
            url: `https://www.bungie.net${newsItem?.Link}`,
            description: newsItem?.Description,
            images: ogImages,
        },
    };
}

export default async function Home({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;
    const newsItem = await s3.getNewsItemFromLink(slug.join("/"));

    return (
        <main className="flex flex-col gap-1 row-start-2 items-center sm:items-start fui body">
            <div className="flex gap-1 items-center flex-col sm:flex-row">
                <h1 className="text-lg md:text-4xl header tooltip">
                    <Link href={`https://www.bungie.net${newsItem?.Link}`}>
                        {newsItem?.Title}
                    </Link>
                    <small className="text-sm text-gray-500 ml-4">
                        {newsItem?.PubDate.toString()}
                    </small>
                </h1>
            </div>
            <div>
                <h2 className="text-lg md:text-2xl header tooltip text-gray-500">
                    {newsItem?.Description}
                </h2>
            </div>
            <div className="flex gap-4 items-center flex-col sm:flex-row">
                {newsItem?.OptionalMobileImagePath && (
                    <Image
                        src={newsItem.OptionalMobileImagePath}
                        alt={newsItem.Title}
                        width={570}
                        height={286}
                        className="w-full max-w-2xl rounded-lg"
                    />
                )}
            </div>
            <div
                className="flex gap-4 flex-col sm:flex-col"
                dangerouslySetInnerHTML={{
                    __html: newsItem?.HtmlContent || "",
                }}
            ></div>
        </main>
    );
}
