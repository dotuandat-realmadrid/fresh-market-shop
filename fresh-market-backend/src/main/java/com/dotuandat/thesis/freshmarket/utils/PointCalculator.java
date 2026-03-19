package com.dotuandat.thesis.freshmarket.utils;

public final class PointCalculator {

    private static final double SOLD_QUANTITY_WEIGHT = 0.3;
    private static final double RATING_WEIGHT = 0.7;
    private static final int MAX_SOLD_QUANTITY = 10000; // Điều chỉnh dựa trên dữ liệu thực tế
    private static final int REVIEW_THRESHOLD = 10; // Số đánh giá tối thiểu để tin cậy

    private PointCalculator() {}

    /**
     * Tính điểm (point) cải tiến với xử lý đánh giá thấp và số lượng reviews
     */
    public static double calculatePoint(int soldQuantity, double avgRating, int reviewCount) {
        // Bước 1: Chuẩn hóa số lượng bán về thang 0-5
        double scaledSold = normalizeSoldQuantity(soldQuantity);

        // Bước 2: Tính toán điểm rating với hình phạt cho rating thấp
        double mappedRating = calculateMappedRating(avgRating);

        // Bước 3: Điều chỉnh trọng số rating dựa trên số lượng reviews
        double effectiveRatingWeight = calculateEffectiveRatingWeight(reviewCount);
        double effectiveSoldWeight = 1 - effectiveRatingWeight;

        // Bước 4: Tính điểm tổng và làm tròn
        double point = (effectiveSoldWeight * SOLD_QUANTITY_WEIGHT * scaledSold)
                + (effectiveRatingWeight * RATING_WEIGHT * mappedRating);

        return Math.max(Math.round(point * 10000.0) / 10000.0, 0); // Đảm bảo điểm không âm
    }

    private static double normalizeSoldQuantity(int sold) {
        // Sử dụng log để giảm tốc độ tăng
        double logSold = Math.log(sold + 1);
        double logMax = Math.log(MAX_SOLD_QUANTITY + 1);
        return (logSold / logMax) * 5; // Scale về 0-5
    }

    private static double calculateMappedRating(double rating) {
        // Hình phạt gấp đôi cho rating dưới 2.5
        if (rating < 2.5) {
            return 2 * (rating - 2.5); // Nhân 2 để tăng hình phạt
        }
        return rating - 2.5; // Trên 2.5 được thưởng
    }

    private static double calculateEffectiveRatingWeight(int reviewCount) {
        // Giảm trọng số rating nếu ít reviews
        return Math.min(reviewCount / (double) REVIEW_THRESHOLD, 1.0);
    }
}
