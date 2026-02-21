"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { BookOpen, Search, Check, ChevronsUpDown, ShieldAlert, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  APPELLATE_COURT_LABELS,
  APPELLATE_OUTCOME_LABELS,
  APPELLATE_OUTCOME_COLORS,
  OFFENSE_CATEGORY_LABELS,
} from "@/lib/intelligence-constants";

const AGENCY_TYPES = [
  { value: "city_pd", label: "City Police Department", needsInput: "city" as const },
  { value: "sheriff", label: "Sheriff's Department", needsInput: "county" as const },
  { value: "state_police", label: "Indiana State Police", needsInput: null },
  { value: "town_marshal", label: "Town Marshal", needsInput: "city" as const },
  { value: "excise_police", label: "Excise Police", needsInput: null },
  { value: "conservation", label: "Conservation Officer", needsInput: null },
];

const INDIANA_COUNTIES = [
  "Adams", "Allen", "Bartholomew", "Benton", "Blackford", "Boone", "Brown",
  "Carroll", "Cass", "Clark", "Clay", "Clinton", "Crawford", "Daviess",
  "Dearborn", "Decatur", "DeKalb", "Delaware", "Dubois", "Elkhart",
  "Fayette", "Floyd", "Fountain", "Franklin", "Fulton", "Gibson", "Grant",
  "Greene", "Hamilton", "Hancock", "Harrison", "Hendricks", "Henry", "Howard",
  "Huntington", "Jackson", "Jasper", "Jay", "Jefferson", "Jennings", "Johnson",
  "Knox", "Kosciusko", "LaGrange", "Lake", "LaPorte", "Lawrence", "Madison",
  "Marion", "Marshall", "Martin", "Miami", "Monroe", "Montgomery", "Morgan",
  "Newton", "Noble", "Ohio", "Orange", "Owen", "Parke", "Perry", "Pike",
  "Porter", "Posey", "Pulaski", "Putnam", "Randolph", "Ripley", "Rush",
  "St. Joseph", "Scott", "Shelby", "Spencer", "Starke", "Steuben", "Sullivan",
  "Switzerland", "Tippecanoe", "Tipton", "Union", "Vanderburgh", "Vermillion",
  "Vigo", "Wabash", "Warren", "Warrick", "Washington", "Wayne", "Wells",
  "White", "Whitley",
];

interface Opinion {
  id: string;
  court: string;
  caseName: string;
  docketNumber: string;
  dateFiled: string | Date;
  authors: string;
  panel: string;
  outcome: string;
  summary: string | null;
  pdfUrl: string | null;
  sourceUrl: string;
  county: string | null;
  offenseCategory: string | null;
  citeCount: number;
}

interface PoliceErrorResult {
  id: string | null;
  clusterId: number;
  caseName: string;
  docketNumber: string;
  dateFiled: string;
  court: string;
  courtId: string;
  judge: string;
  outcome: string | null;
  county: string | null;
  offenseCategory: string | null;
  snippet: string;
  pdfUrl: string | null;
  sourceUrl: string;
  citeCount: number;
}

interface OpinionsData {
  opinions: Opinion[];
  total: number;
  reversalRate: number;
  courtCounts: { court: string; count: number }[];
  topAuthors: { name: string; count: number }[];
  counties: string[];
}

export function OpinionsClient({ data }: { data: OpinionsData }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [courtFilter, setCourtFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [countyOpen, setCountyOpen] = useState(false);

  // Police Error Reversals state
  const [policeErrorMode, setPoliceErrorMode] = useState(false);
  const [policeErrorResults, setPoliceErrorResults] = useState<PoliceErrorResult[]>([]);
  const [policeErrorTotal, setPoliceErrorTotal] = useState(0);
  const [policeErrorLoading, setPoliceErrorLoading] = useState(false);
  const [policeErrorQueries, setPoliceErrorQueries] = useState<string[]>([]);
  const [policeErrorQueryIndex, setPoliceErrorQueryIndex] = useState("all");

  // Agency filter state
  const [agencyType, setAgencyType] = useState("any");
  const [agencyCity, setAgencyCity] = useState("");
  const [agencyCounty, setAgencyCounty] = useState("");
  const [agencyCountyOpen, setAgencyCountyOpen] = useState(false);

  const fetchPoliceErrors = useCallback(async (qi = "all", overrideAgencyType?: string, overrideAgencyName?: string) => {
    setPoliceErrorLoading(true);
    try {
      const params = new URLSearchParams({ qi });
      if (countyFilter !== "all") params.set("county", countyFilter);

      const aType = overrideAgencyType ?? agencyType;
      if (aType && aType !== "any") {
        params.set("agencyType", aType);
        const agencyConfig = AGENCY_TYPES.find((a) => a.value === aType);
        const name = overrideAgencyName ?? (agencyConfig?.needsInput === "city" ? agencyCity : agencyConfig?.needsInput === "county" ? agencyCounty : "");
        if (name) params.set("agencyName", name);
      }

      const res = await fetch(`/api/intelligence/opinions/police-errors?${params}`);
      const json = await res.json();
      setPoliceErrorResults(json.results || []);
      setPoliceErrorTotal(json.total || 0);
      setPoliceErrorQueries(json.queries || []);
      setPoliceErrorQueryIndex(String(qi));
    } catch (err) {
      console.error("Failed to fetch police error reversals:", err);
    } finally {
      setPoliceErrorLoading(false);
    }
  }, [countyFilter, agencyType, agencyCity, agencyCounty]);

  const togglePoliceErrorMode = useCallback(() => {
    if (policeErrorMode) {
      setPoliceErrorMode(false);
      setPoliceErrorResults([]);
      setPoliceErrorTotal(0);
      setAgencyType("any");
      setAgencyCity("");
      setAgencyCounty("");
    } else {
      setPoliceErrorMode(true);
      fetchPoliceErrors("all");
    }
  }, [policeErrorMode, fetchPoliceErrors]);

  const filtered = data.opinions.filter((o) => {
    if (
      search &&
      !o.caseName.toLowerCase().includes(search.toLowerCase()) &&
      !o.docketNumber.toLowerCase().includes(search.toLowerCase()) &&
      !o.authors.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (courtFilter !== "all" && o.court !== courtFilter) return false;
    if (outcomeFilter !== "all" && o.outcome !== outcomeFilter) return false;
    if (countyFilter !== "all" && o.county?.toLowerCase() !== countyFilter.toLowerCase()) return false;
    if (categoryFilter !== "all" && o.offenseCategory !== categoryFilter)
      return false;
    return true;
  });

  const topAuthor = data.topAuthors[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Appellate Opinions</h1>
          <p className="text-sm text-muted-foreground">
            {data.total} Indiana criminal appellate opinions
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Opinions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">
              {data.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reversal Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {data.reversalRate}%
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Active Author
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-indigo-700 truncate">
              {topAuthor ? topAuthor.name : "—"}
            </div>
            {topAuthor && (
              <div className="text-xs text-muted-foreground">
                {topAuthor.count} opinions
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button
        variant={policeErrorMode ? "default" : "outline"}
        className={cn(
          "w-full justify-start gap-2 text-left",
          policeErrorMode
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
        )}
        onClick={togglePoliceErrorMode}
      >
        {policeErrorLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldAlert className="h-4 w-4" />
        )}
        <span className="font-semibold">Police Error Reversals</span>
        <span className={cn("text-sm", policeErrorMode ? "text-red-100" : "text-red-400")}>
          — Search cases reversed due to constitutional violations, unlawful searches, Miranda issues &amp; more
        </span>
        {policeErrorMode && (
          <>
            <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-0">
              {policeErrorTotal} found
            </Badge>
            <X className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search opinions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={courtFilter} onValueChange={setCourtFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Court" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courts</SelectItem>
            <SelectItem value="SUPREME_COURT">Supreme Court</SelectItem>
            <SelectItem value="COURT_OF_APPEALS">Court of Appeals</SelectItem>
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            {Object.entries(APPELLATE_OUTCOME_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover open={countyOpen} onOpenChange={setCountyOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={countyOpen}
              className="w-[200px] justify-between font-normal"
            >
              {countyFilter === "all"
                ? "All Counties"
                : `${countyFilter} County`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search county..." />
              <CommandList>
                <CommandEmpty>No county found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      setCountyFilter("all");
                      setCountyOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        countyFilter === "all" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Counties
                  </CommandItem>
                  {INDIANA_COUNTIES.map((county) => (
                    <CommandItem
                      key={county}
                      value={county}
                      onSelect={() => {
                        setCountyFilter(county);
                        setCountyOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          countyFilter === county ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {county}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Offense" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offenses</SelectItem>
            {Object.entries(OFFENSE_CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {policeErrorMode && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Search topic:</span>
            <Select
              value={policeErrorQueryIndex}
              onValueChange={(v) => fetchPoliceErrors(v)}
            >
              <SelectTrigger className="w-[320px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {policeErrorQueries.map((q, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-2">
              {policeErrorTotal.toLocaleString()} opinions match across all Indiana appellate cases
            </span>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Agency filter:</span>
              <Select
                value={agencyType}
                onValueChange={(v) => {
                  setAgencyType(v);
                  setAgencyCity("");
                  setAgencyCounty("");
                }}
              >
                <SelectTrigger className="w-[240px] mt-1">
                  <SelectValue placeholder="Select agency type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Agency</SelectItem>
                  {AGENCY_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {agencyType !== "any" && AGENCY_TYPES.find((a) => a.value === agencyType)?.needsInput === "city" && (
              <div>
                <Input
                  placeholder="City name (e.g. Fishers)"
                  value={agencyCity}
                  onChange={(e) => setAgencyCity(e.target.value)}
                  className="w-[220px]"
                />
              </div>
            )}
            {agencyType === "sheriff" && (
              <div>
                <Popover open={agencyCountyOpen} onOpenChange={setAgencyCountyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={agencyCountyOpen}
                      className="w-[220px] justify-between font-normal"
                    >
                      {agencyCounty || "Select county..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0">
                    <Command>
                      <CommandInput placeholder="Search county..." />
                      <CommandList>
                        <CommandEmpty>No county found.</CommandEmpty>
                        <CommandGroup>
                          {INDIANA_COUNTIES.map((c) => (
                            <CommandItem
                              key={c}
                              value={c}
                              onSelect={() => {
                                setAgencyCounty(c);
                                setAgencyCountyOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  agencyCounty === c ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {c}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {agencyType !== "any" && (
              <Button
                onClick={() => fetchPoliceErrors(policeErrorQueryIndex)}
                disabled={
                  policeErrorLoading ||
                  (AGENCY_TYPES.find((a) => a.value === agencyType)?.needsInput === "city" && !agencyCity.trim()) ||
                  (agencyType === "sheriff" && !agencyCounty)
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {policeErrorLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search Agency
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {policeErrorMode ? (
          policeErrorLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                Searching CourtListener for police error reversals...
              </CardContent>
            </Card>
          ) : policeErrorResults.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No police error reversals found for this search.
              </CardContent>
            </Card>
          ) : (
            policeErrorResults.map((result) => {
              const content = (
                <Card key={result.clusterId} className="transition-colors hover:bg-muted/50">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                          <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {result.caseName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.docketNumber} &middot; {result.court}
                            {result.county && ` &middot; ${result.county} County`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        {result.outcome && (
                          <Badge
                            variant="outline"
                            className={APPELLATE_OUTCOME_COLORS[result.outcome] || ""}
                          >
                            {APPELLATE_OUTCOME_LABELS[result.outcome] || result.outcome}
                          </Badge>
                        )}
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Judge</div>
                          <span className="text-sm font-medium truncate max-w-[150px] block">
                            {result.judge || "—"}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Filed</div>
                          <span className="text-sm font-medium">
                            {format(new Date(result.dateFiled), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {result.snippet && result.snippet.length > 50 && (
                      <p className="text-xs text-muted-foreground line-clamp-2 ml-14">
                        {result.snippet}
                      </p>
                    )}
                    <div className="flex gap-3 ml-14">
                      {result.pdfUrl && (
                        <a
                          href={result.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View PDF
                        </a>
                      )}
                      <a
                        href={result.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        CourtListener
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
              return (
                <div
                  key={result.clusterId}
                  className="cursor-pointer"
                  onClick={() => router.push(`/intelligence/opinions/cl/${result.clusterId}`)}
                >
                  {content}
                </div>
              );
            })
          )
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No opinions found matching your criteria.
            </CardContent>
          </Card>
        ) : (
          filtered.map((opinion) => (
            <Link
              key={opinion.id}
              href={`/intelligence/opinions/${opinion.id}`}
            >
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {opinion.caseName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {opinion.docketNumber} &middot;{" "}
                        {APPELLATE_COURT_LABELS[opinion.court] || opinion.court}
                        {opinion.county && ` &middot; ${opinion.county} County`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <Badge
                      variant="outline"
                      className={
                        APPELLATE_OUTCOME_COLORS[opinion.outcome] || ""
                      }
                    >
                      {APPELLATE_OUTCOME_LABELS[opinion.outcome] ||
                        opinion.outcome}
                    </Badge>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Authors
                      </div>
                      <span className="text-sm font-medium truncate max-w-[150px] block">
                        {opinion.authors || "—"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Filed</div>
                      <span className="text-sm font-medium">
                        {format(new Date(opinion.dateFiled), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
