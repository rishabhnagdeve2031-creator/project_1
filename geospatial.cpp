#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <iomanip>

// Structure representing a 2D coordinate point
struct Point {
    double lat;
    double lng;
};

// Structure representing a Tiger telemetry record
struct Tiger {
    int id;
    std::string name;
    Point coords;
};

// Ray casting algorithm for Point-in-Polygon detection
bool isPointInPolygon(const Point& point, const std::vector<Point>& polygon) {
    double py = point.lat; // Latitude (Y axis)
    double px = point.lng; // Longitude (X axis)
    bool inside = false;

    size_t numVertices = polygon.size();
    for (size_t i = 0, j = numVertices - 1; i < numVertices; j = i++) {
        const Point& vi = polygon[i];
        const Point& vj = polygon[j];

        double viy = vi.lat;
        double vix = vi.lng;
        double vjy = vj.lat;
        double vjx = vj.lng;

        // Check if the ray cast horizontally to the right intersects the edge between vi and vj
        bool intersect = ((viy > py) != (vjy > py))
            && (px < (vjx - vix) * (py - viy) / (vjy - viy) + vix);
        
        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
}

// Convert degrees to radians
double toRad(double deg) {
    const double PI = 3.14159265358979323846;
    return (deg * PI) / 180.0;
}

// Haversine formula to compute great-circle distance in kilometers
double getDistanceKm(double lat1, double lng1, double lat2, double lng2) {
    const double R = 6371.0; // Earth's radius in kilometers

    double dLat = toRad(lat2 - lat1);
    double dLng = toRad(lng2 - lng1);

    double radLat1 = toRad(lat1);
    double radLat2 = toRad(lat2);

    // Haversine calculation
    double a = std::sin(dLat / 2.0) * std::sin(dLat / 2.0) +
               std::cos(radLat1) * std::cos(radLat2) *
               std::sin(dLng / 2.0) * std::sin(dLng / 2.0);

    double c = 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));

    return R * c;
}

int main() {
    // Define a square wildlife reserve zone (our polygon)
    std::vector<Point> tigerSanctuaryZone = {
        {12.0, 76.0}, // Southwest corner
        {12.0, 79.0}, // Southeast corner
        {15.0, 79.0}, // Northeast corner
        {15.0, 76.0}  // Northwest corner
    };

    // Vector of Tiger telemetry records
    std::vector<Tiger> tigers = {
        { 1, "Shera",    {13.5, 77.5} },  // Well inside the sanctuary
        { 2, "Bagheera", {11.0, 75.0} },  // Far outside (south-west)
        { 3, "Raja",     {14.9, 78.9} },  // Near the northeast boundary, but inside
        { 4, "T2",       {15.5, 76.5} }   // Outside (north)
    };

    // Reference point: The ranger station coordinates
    Point rangerStation = {13.0, 77.0};

    std::cout << "=== Wildlife Tracking Simulation: Real-Time Telemetry Processing ===\n\n";

    // 1. Run Point-in-Polygon checks (Zone Breach Detection)
    std::cout << "--- Zone Breach Detection (Checking Sanctuary Boundaries) ---\n";
    for (size_t i = 0; i < tigers.size(); ++i) {
        const Tiger& tiger = tigers[i];
        bool isInside = isPointInPolygon(tiger.coords, tigerSanctuaryZone);

        if (isInside) {
            std::cout << "[SAFE] " << tiger.name << " (ID: " << tiger.id 
                      << ") is inside the sanctuary zone at [" << tiger.coords.lat << ", " << tiger.coords.lng << "].\n";
        } else {
            std::cout << "[ALERT] BREACH DETECTED! " << tiger.name << " (ID: " << tiger.id 
                      << ") has wandered outside the sanctuary at [" << tiger.coords.lat << ", " << tiger.coords.lng << "]!\n";
        }
    }

    std::cout << "\n--- Ranger Proximity Check (Haversine Distance to Ranger Station) ---\n";
    std::cout << "Ranger Station Location: [" << rangerStation.lat << ", " << rangerStation.lng << "]\n\n";

    // 2. Run Haversine calculations
    for (size_t i = 0; i < tigers.size(); ++i) {
        const Tiger& tiger = tigers[i];
        double distance = getDistanceKm(
            rangerStation.lat, rangerStation.lng,
            tiger.coords.lat, tiger.coords.lng
        );

        std::cout << tiger.name << " is " << std::fixed << std::setprecision(2) 
                  << distance << " km away from the Ranger Station.\n";
    }

    return 0;
}
