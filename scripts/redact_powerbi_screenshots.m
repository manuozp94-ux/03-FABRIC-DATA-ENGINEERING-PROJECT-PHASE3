#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>
#import <ImageIO/ImageIO.h>

static void usage(void) {
    fprintf(stderr, "Usage: redact_powerbi_screenshots <input-dir> <output-dir>\n");
    exit(2);
}

static BOOL isSupportedImage(NSString *path) {
    NSString *ext = [[path pathExtension] lowercaseString];
    return [@[@"png", @"jpg", @"jpeg", @"webp"] containsObject:ext];
}

static CGImageRef loadImage(NSURL *url) {
    CGImageSourceRef source = CGImageSourceCreateWithURL((__bridge CFURLRef)url, NULL);
    if (!source) {
        return NULL;
    }

    CGImageRef image = CGImageSourceCreateImageAtIndex(source, 0, NULL);
    CFRelease(source);
    return image;
}

static CGContextRef createRGBContext(size_t width, size_t height) {
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(
        NULL,
        width,
        height,
        8,
        0,
        colorSpace,
        (CGBitmapInfo)kCGImageAlphaPremultipliedLast
    );
    CGColorSpaceRelease(colorSpace);
    return context;
}

static void addMask(NSMutableArray<NSValue *> *masks, CGFloat x, CGFloat y, CGFloat width, CGFloat height) {
    [masks addObject:[NSValue valueWithRect:NSMakeRect(x, y, width, height)]];
}

static NSMutableArray<NSValue *> *masksForFile(NSString *fileName) {
    NSMutableArray<NSValue *> *masks = [NSMutableArray array];

    if ([fileName isEqualToString:@"GENERAL MARGIN REPORT 1.png"]) {
        addMask(masks, 24, 15, 115, 42);
        addMask(masks, 815, 508, 270, 45);
        addMask(masks, 805, 590, 282, 50);
        addMask(masks, 121, 518, 610, 142);
        addMask(masks, 8, 790, 1068, 440);
    } else if ([fileName isEqualToString:@"GENERAL MARGIN REPORT 2.png"]) {
        addMask(masks, 24, 15, 115, 42);
        addMask(masks, 805, 310, 270, 45);
        addMask(masks, 795, 392, 282, 50);
        addMask(masks, 121, 323, 610, 112);
        addMask(masks, 7, 557, 1070, 452);
    } else if ([fileName isEqualToString:@"GENERAL MARGIN REPORT 3.png"]) {
        addMask(masks, 24, 15, 300, 42);
        addMask(masks, 150, 100, 82, 15);
        addMask(masks, 326, 168, 160, 17);
        addMask(masks, 330, 178, 200, 17);
        addMask(masks, 110, 319, 75, 88);
        addMask(masks, 190, 312, 313, 292);
        addMask(masks, 516, 312, 343, 292);
        addMask(masks, 0, 666, 376, 132);
        addMask(masks, 0, 834, 380, 148);
        addMask(masks, 405, 746, 195, 205);
        addMask(masks, 532, 708, 335, 248);
        addMask(masks, 0, 1036, 865, 198);
    } else if ([fileName isEqualToString:@"GENERAL MARGIN REPORT 4.png"]) {
        addMask(masks, 24, 15, 300, 42);
        addMask(masks, 124, 226, 128, 70);
        addMask(masks, 0, 370, 438, 190);
        addMask(masks, 462, 370, 397, 190);
        addMask(masks, 124, 294, 128, 18);
        addMask(masks, 0, 644, 865, 350);
    } else if ([fileName isEqualToString:@"GENERAL MARGIN REPORT 5.png"]) {
        addMask(masks, 24, 15, 300, 42);
        addMask(masks, 0, 341, 870, 286);
    } else if ([fileName isEqualToString:@"GENERAL MARGIN REPORT 6.png"]) {
        addMask(masks, 214, 20, 154, 22);
        addMask(masks, 452, 843, 158, 22);
        addMask(masks, 1054, 20, 158, 22);
    } else if ([fileName isEqualToString:@"POS ANALYSIS REPORT 1.png"]) {
        addMask(masks, 24, 16, 456, 42);
        addMask(masks, 8, 124, 88, 14);
        addMask(masks, 60, 286, 122, 330);
        addMask(masks, 123, 284, 212, 330);
        addMask(masks, 472, 265, 162, 40);
        addMask(masks, 360, 325, 276, 295);
        addMask(masks, 10, 774, 635, 132);
        addMask(masks, 584, 900, 62, 22);
        addMask(masks, 10, 956, 635, 152);
        addMask(masks, 582, 1080, 64, 22);
        addMask(masks, 10, 1150, 635, 106);
    } else if ([fileName isEqualToString:@"POS ANALYSIS REPORT 2.png"]) {
        addMask(masks, 1232, 122, 170, 24);
        addMask(masks, 30, 246, 170, 312);
        addMask(masks, 205, 246, 108, 36);
        addMask(masks, 198, 500, 166, 48);
        addMask(masks, 318, 500, 238, 54);
        addMask(masks, 360, 270, 198, 270);
        addMask(masks, 565, 244, 235, 310);
        addMask(masks, 810, 264, 245, 265);
        addMask(masks, 1008, 246, 100, 44);
        addMask(masks, 900, 510, 292, 44);
        addMask(masks, 1115, 505, 168, 45);
        addMask(masks, 1190, 298, 170, 252);
        addMask(masks, 1358, 244, 224, 280);
        addMask(masks, 20, 650, 468, 218);
        addMask(masks, 385, 852, 110, 34);
        addMask(masks, 545, 650, 415, 205);
        addMask(masks, 1350, 650, 146, 220);
    } else if ([fileName isEqualToString:@"SALES DASHBOARD 1.png"]) {
        addMask(masks, 34, 23, 92, 86);
        addMask(masks, 220, 250, 302, 212);
        addMask(masks, 584, 248, 146, 186);
        addMask(masks, 775, 268, 430, 194);
        addMask(masks, 252, 540, 402, 165);
        addMask(masks, 714, 552, 486, 188);
        addMask(masks, 1239, 160, 122, 545);
    } else if ([fileName isEqualToString:@"SALES DASHBOARD 2.png"]) {
        addMask(masks, 34, 23, 92, 86);
        addMask(masks, 793, 268, 414, 194);
        addMask(masks, 793, 552, 414, 188);
        addMask(masks, 1228, 160, 128, 570);
    } else if ([fileName isEqualToString:@"SALES DASHBOARD 3.png"]) {
        addMask(masks, 34, 23, 92, 86);
        addMask(masks, 222, 290, 726, 266);
        addMask(masks, 1028, 418, 130, 34);
        addMask(masks, 1028, 534, 136, 38);
        addMask(masks, 222, 630, 966, 106);
    } else if ([fileName isEqualToString:@"SALES DASHBOARD 4.png"]) {
        addMask(masks, 34, 23, 92, 86);
        addMask(masks, 212, 394, 976, 344);
    } else if ([fileName isEqualToString:@"SPA CLAIM AUDIT REPORT 1.png"]) {
        addMask(masks, 24, 18, 310, 42);
        addMask(masks, 10, 566, 347, 145);
        addMask(masks, 369, 566, 372, 145);
        addMask(masks, 776, 552, 98, 168);
        addMask(masks, 10, 790, 856, 190);
        addMask(masks, 290, 710, 72, 22);
        addMask(masks, 670, 710, 74, 22);
        addMask(masks, 790, 980, 78, 22);
    } else if ([fileName isEqualToString:@"SPA CLAIM AUDIT REPORT 2.png"]) {
        addMask(masks, 14, 122, 340, 136);
        addMask(masks, 372, 122, 372, 136);
        addMask(masks, 760, 120, 112, 130);
        addMask(masks, 13, 286, 370, 160);
        addMask(masks, 393, 286, 475, 170);
        addMask(masks, 12, 512, 855, 220);
        addMask(masks, 300, 444, 86, 22);
        addMask(masks, 790, 444, 82, 22);
        addMask(masks, 784, 724, 84, 22);
    } else if ([fileName isEqualToString:@"SPA CLAIM AUDIT REPORT 4.png"]) {
        addMask(masks, 24, 18, 310, 42);
        addMask(masks, 466, 138, 205, 18);
        addMask(masks, 10, 344, 850, 118);
    }

    return masks;
}

static NSMutableArray<NSValue *> *solidMasksForFile(NSString *fileName) {
    NSMutableArray<NSValue *> *masks = [NSMutableArray array];

    if ([fileName hasPrefix:@"SALES DASHBOARD"] && ![fileName isEqualToString:@"SALES DASHBOARD 5.png"]) {
        addMask(masks, 34, 23, 92, 86);
    } else if ([fileName hasPrefix:@"GENERAL MARGIN REPORT"] && ![fileName isEqualToString:@"GENERAL MARGIN REPORT 6.png"]) {
        addMask(masks, 24, 15, 72, 42);
    } else if ([fileName isEqualToString:@"POS ANALYSIS REPORT 1.png"]) {
        addMask(masks, 24, 16, 78, 42);
    } else if ([fileName isEqualToString:@"SPA CLAIM AUDIT REPORT 1.png"] || [fileName isEqualToString:@"SPA CLAIM AUDIT REPORT 4.png"]) {
        addMask(masks, 24, 18, 78, 42);
    }

    return masks;
}

static void drawSolidMask(CGContextRef context, size_t width, size_t height, NSValue *maskValue) {
    NSRect topLeftMask = [maskValue rectValue];
    CGRect mask = CGRectMake(
        topLeftMask.origin.x,
        (CGFloat)height - topLeftMask.origin.y - topLeftMask.size.height,
        topLeftMask.size.width,
        topLeftMask.size.height
    );
    CGRect bounds = CGRectMake(0, 0, width, height);
    mask = CGRectIntersection(mask, bounds);

    if (CGRectIsNull(mask) || CGRectIsEmpty(mask)) {
        return;
    }

    CGContextSetRGBFillColor(context, 0.55, 0.60, 0.64, 1.0);
    CGContextFillRect(context, mask);
}

static CGImageRef pixelatedImage(CGImageRef sourceImage) {
    size_t width = CGImageGetWidth(sourceImage);
    size_t height = CGImageGetHeight(sourceImage);
    size_t smallWidth = MAX((size_t)30, (size_t)llround((double)width / 33.0));
    size_t smallHeight = MAX((size_t)20, (size_t)llround((double)height * ((double)smallWidth / (double)width)));

    CGContextRef smallContext = createRGBContext(smallWidth, smallHeight);
    if (!smallContext) {
        return NULL;
    }

    CGContextSetInterpolationQuality(smallContext, kCGInterpolationHigh);
    CGContextDrawImage(smallContext, CGRectMake(0, 0, smallWidth, smallHeight), sourceImage);
    CGImageRef smallImage = CGBitmapContextCreateImage(smallContext);
    CGContextRelease(smallContext);

    if (!smallImage) {
        return NULL;
    }

    CGContextRef outputContext = createRGBContext(width, height);
    if (!outputContext) {
        CGImageRelease(smallImage);
        return NULL;
    }

    CGContextSetInterpolationQuality(outputContext, kCGInterpolationNone);
    CGContextDrawImage(outputContext, CGRectMake(0, 0, width, height), smallImage);
    CGImageRelease(smallImage);

    return CGBitmapContextCreateImage(outputContext);
}

static void fillMask(CGContextRef context, CGFloat x, CGFloat y, CGFloat width, CGFloat height) {
    CGContextFillRect(context, CGRectMake(x, y, width, height));
}

static void drawPixelatedMask(CGContextRef context, CGImageRef pixelated, size_t width, size_t height, NSValue *maskValue) {
    NSRect topLeftMask = [maskValue rectValue];
    CGRect mask = CGRectMake(
        topLeftMask.origin.x,
        (CGFloat)height - topLeftMask.origin.y - topLeftMask.size.height,
        topLeftMask.size.width,
        topLeftMask.size.height
    );
    CGRect bounds = CGRectMake(0, 0, width, height);
    mask = CGRectIntersection(mask, bounds);

    if (CGRectIsNull(mask) || CGRectIsEmpty(mask)) {
        return;
    }

    CGContextSaveGState(context);
    CGContextClipToRect(context, mask);
    CGContextDrawImage(context, bounds, pixelated);
    CGContextRestoreGState(context);
}

static CGImageRef redactedImage(CGImageRef sourceImage, NSString *fileName) {
    size_t width = CGImageGetWidth(sourceImage);
    size_t height = CGImageGetHeight(sourceImage);
    CGImageRef pixelated = pixelatedImage(sourceImage);
    if (!pixelated) {
        return NULL;
    }

    CGContextRef context = createRGBContext(width, height);
    if (!context) {
        CGImageRelease(pixelated);
        return NULL;
    }

    CGContextSetInterpolationQuality(context, kCGInterpolationHigh);
    CGContextDrawImage(context, CGRectMake(0, 0, width, height), sourceImage);

    NSArray<NSValue *> *masks = masksForFile(fileName);
    for (NSValue *mask in masks) {
        drawPixelatedMask(context, pixelated, width, height, mask);
    }

    NSArray<NSValue *> *solidMasks = solidMasksForFile(fileName);
    for (NSValue *mask in solidMasks) {
        drawSolidMask(context, width, height, mask);
    }

    CGImageRelease(pixelated);

    CGImageRef output = CGBitmapContextCreateImage(context);
    CGContextRelease(context);
    return output;
}

static BOOL writePNG(CGImageRef image, NSURL *url, NSError **error) {
    CGImageDestinationRef destination = CGImageDestinationCreateWithURL(
        (__bridge CFURLRef)url,
        CFSTR("public.png"),
        1,
        NULL
    );
    if (!destination) {
        if (error) {
            *error = [NSError errorWithDomain:@"Redaction" code:1 userInfo:@{NSLocalizedDescriptionKey: @"Could not create image destination"}];
        }
        return NO;
    }

    CGImageDestinationAddImage(destination, image, NULL);
    BOOL success = CGImageDestinationFinalize(destination);
    CFRelease(destination);

    if (!success && error) {
        *error = [NSError errorWithDomain:@"Redaction" code:2 userInfo:@{NSLocalizedDescriptionKey: @"Could not write image"}];
    }
    return success;
}

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        if (argc != 3) {
            usage();
        }

        NSString *inputDir = [NSString stringWithUTF8String:argv[1]];
        NSString *outputDir = [NSString stringWithUTF8String:argv[2]];
        NSFileManager *fileManager = [NSFileManager defaultManager];

        NSError *error = nil;
        if (![fileManager createDirectoryAtPath:outputDir withIntermediateDirectories:YES attributes:nil error:&error]) {
            fprintf(stderr, "Could not create output directory: %s\n", [[error localizedDescription] UTF8String]);
            return 1;
        }

        NSArray<NSString *> *contents = [fileManager contentsOfDirectoryAtPath:inputDir error:&error];
        if (!contents) {
            fprintf(stderr, "Could not read input directory: %s\n", [[error localizedDescription] UTF8String]);
            return 1;
        }

        NSArray<NSString *> *files = [[contents filteredArrayUsingPredicate:[NSPredicate predicateWithBlock:^BOOL(NSString *fileName, NSDictionary *bindings) {
            BOOL isDir = NO;
            NSString *fullPath = [inputDir stringByAppendingPathComponent:fileName];
            [fileManager fileExistsAtPath:fullPath isDirectory:&isDir];
            return !isDir && isSupportedImage(fileName);
        }]] sortedArrayUsingSelector:@selector(localizedStandardCompare:)];

        if ([files count] == 0) {
            fprintf(stderr, "No supported images found in %s\n", [inputDir UTF8String]);
            return 1;
        }

        NSUInteger index = 1;
        for (NSString *fileName in files) {
            NSString *inputPath = [inputDir stringByAppendingPathComponent:fileName];
            NSString *outputName = [NSString stringWithFormat:@"power-bi-dashboard-redacted-%02lu.png", (unsigned long)index];
            NSString *outputPath = [outputDir stringByAppendingPathComponent:outputName];
            NSURL *inputURL = [NSURL fileURLWithPath:inputPath];
            NSURL *outputURL = [NSURL fileURLWithPath:outputPath];

            CGImageRef sourceImage = loadImage(inputURL);
            if (!sourceImage) {
                fprintf(stderr, "Failed to read %s\n", [fileName UTF8String]);
                return 1;
            }

            CGImageRef outputImage = redactedImage(sourceImage, fileName);
            CGImageRelease(sourceImage);

            if (!outputImage) {
                fprintf(stderr, "Failed to redact %s\n", [fileName UTF8String]);
                return 1;
            }

            if (!writePNG(outputImage, outputURL, &error)) {
                CGImageRelease(outputImage);
                fprintf(stderr, "Failed to write %s: %s\n", [outputName UTF8String], [[error localizedDescription] UTF8String]);
                return 1;
            }

            size_t width = CGImageGetWidth(outputImage);
            size_t height = CGImageGetHeight(outputImage);
            CGImageRelease(outputImage);
            printf("%s -> %s (%zux%zu)\n", [fileName UTF8String], [outputName UTF8String], width, height);
            index += 1;
        }
    }

    return 0;
}
