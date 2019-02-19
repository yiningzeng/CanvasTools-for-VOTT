import { RGBColor } from "./RGBColor";
import { SRGBColor } from "./SRGBColor";
import { XYZColor } from "./XYZColor";

/**
 * The AB-subspace for the LAB color space.
 */
export interface ILabColorPoint {
    a: number;
    b: number;
}

/**
 * Represents the CIE LAB color space.
 */
export class LABColor implements ILabColorPoint {
    /**
     * The lightness value of the color.
     */
    public get l(): number {
        return this.values[0];
    }

    /**
     * The a-component of the color (green to red).
     */
    public get a(): number {
        return this.values[1];
    }

    /**
     * The b-component of the color (blue to yellow).
     */
    public get b(): number {
        return this.values[2];
    }

    /**
     * Array of color components as [l, a, b].
     */
    private values: number[];

    /**
     * Creates new CIE LAB color.
     * @param l - Lightness component in the range [0, 1].
     * @param a - A-component in the range [0, 1].
     * @param b - B-component in the range [0, 1].
     */
    constructor(l: number, a: number, b: number) {
        this.values = [l, a, b];
    }

    /**
     * Computes color difference using the CIE94 formula as defined here:
     * https://en.wikipedia.org/wiki/Color_difference.
     * @remarks It is better to use the CIE DE2000 formula, but it requires significantly more computations.
     * E.g., check this reveiw: http://www.color.org/events/colorimetry/Melgosa_CIEDE2000_Workshop-July4.pdf.
     * @param color - A color to compare.
     * @returns The distance between this and provided colors.
     */
    public distanceTo(color: LABColor): number {
        const deltaL = this.values[0] - color.values[0];
        const deltaA = this.values[1] - color.values[1];
        const deltaB = this.values[2] - color.values[2];
        const c1 = Math.sqrt(this.values[1] * this.values[1] + this.values[2] * this.values[2]);
        const c2 = Math.sqrt(color.values[1] * color.values[1] + color.values[2] * color.values[2]);
        const deltaC = c1 - c2;
        let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
        const sc = 1.0 + 0.045 * c1;
        const sh = 1.0 + 0.015 * c1;
        const deltaLKlsl = deltaL / (1.0);
        const deltaCkcsc = deltaC / (sc);
        const deltaHkhsh = deltaH / (sh);
        const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
        return i < 0 ? 0 : Math.sqrt(i);
    }

    /**
     * Computes the distance to a=b=0 in the AB-subspace.
     */
    public distanceToGray(): number {
        return Math.sqrt(this.a * this.a + this.b * this.b);
    }

    /**
     * Return a copy of color values in array format as [l, a, b].
     */
    public toArray(): number[] {
        // copy
        return this.values.map((v) => v);
    }

    /**
     * Trasforms color to the XYZ format.
     */
    public toXYZ(): XYZColor {
        let y = (this.l * 100 + 16) / 116;
        let x = this.a / 5 + y;
        let z = y - this.b / 2;

        [x, y, z] = [x, y, z].map((v) => {
            const v3 = v * v * v;
            return (v3 > 0.008856451) ? v3 : (v - 16 / 116) / 7.787037;
        });

        return new XYZColor(x * XYZColor.D65.x, y * XYZColor.D65.y, z * XYZColor.D65.z);
    }

    /**
     * Trasforms color to the RGB format.
     */
    public toRGB(): RGBColor {
        return this.toXYZ().toRGB();
    }

    /**
     * Trasforms color to the sRGB format.
     */
    public toSRGB(): SRGBColor {
        return this.toXYZ().toRGB().toSRGB();
    }
}
