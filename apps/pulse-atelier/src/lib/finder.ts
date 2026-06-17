import { products } from "@/data/products";
import type { Product, UseCase } from "@/types/domain";

export interface FinderRecommendation {
  product: Product;
  reason: string;
}

const rhythmCopy: Record<UseCase, string> = {
  work: "keeps notifications, calendar, and battery life balanced for long workdays",
  fitness: "matches fitness tracking, water resistance, and health sensor needs",
  travel: "prioritizes battery life, comfort, and cross-platform reliability on the move",
  study: "supports reading, notes, calls, and lightweight focus sessions",
  focus: "reduces distractions with audio control, comfort, and long sessions",
  gaming: "favors low-latency audio, display quality, and entertainment features",
  everyday: "balances comfort, price, ecosystem fit, and daily reliability",
  entertainment: "leans into screen, audio, and relaxed daily use",
};

export function recommendProductsForRhythm(rhythm: UseCase): FinderRecommendation[] {
  return products
    .filter((product) => product.status === "active" && product.useCases.includes(rhythm))
    .sort((a, b) => b.rating - a.rating || b.soldCount - a.soldCount)
    .slice(0, 4)
    .map((product) => ({
      product,
      reason: `${product.name} ${rhythmCopy[rhythm]}.`,
    }));
}
