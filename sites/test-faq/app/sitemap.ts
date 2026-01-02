import { MetadataRoute } from 'next';
import { faqPosts } from '@/src/mock/faq';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'http://localhost:3000';
  
  // 기본 페이지
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/zeroboard/zboard.php?id=FAQ`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // FAQ 페이지들 (페이지네이션)
  const totalPages = Math.ceil(faqPosts.length / 10);
  for (let i = 2; i <= totalPages; i++) {
    routes.push({
      url: `${baseUrl}/zeroboard/zboard.php?id=FAQ&page=${i}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // 개별 FAQ 상세 페이지
  faqPosts.forEach(post => {
    routes.push({
      url: `${baseUrl}/zeroboard/zboard.php?id=FAQ&no=${post.no}`,
      lastModified: new Date(post.createdAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  });

  return routes;
}

