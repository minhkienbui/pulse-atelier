import "server-only";

import { prisma } from "@/lib/prisma";
import type { BlogDetailDto, BlogSummaryDto } from "./types";

function mapBlogSummary(blog: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  views: number;
  createdAt: Date;
  author: {
    name: string | null;
  };
}): BlogSummaryDto {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    image: blog.image,
    views: blog.views,
    createdAt: blog.createdAt.toISOString(),
    author: blog.author,
  };
}

export async function getPublishedBlogs(query?: string): Promise<BlogSummaryDto[]> {
  const trimmedQuery = query?.trim();
  const blogs = await prisma.blog.findMany({
    where: {
      isPublished: true,
      ...(trimmedQuery
        ? {
            OR: [
              { title: { contains: trimmedQuery, mode: "insensitive" } },
              { excerpt: { contains: trimmedQuery, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return blogs.map(mapBlogSummary);
}

export async function getBlogBySlug(
  slug: string
): Promise<BlogDetailDto | null> {
  const blog = await prisma.blog.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!blog) return null;

  return {
    ...mapBlogSummary(blog),
    content: blog.content,
  };
}
