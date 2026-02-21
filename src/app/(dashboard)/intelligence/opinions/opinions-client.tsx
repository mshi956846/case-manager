"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, Search, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPELLATE_COURT_LABELS,
  APPELLATE_OUTCOME_LABELS,
  APPELLATE_OUTCOME_COLORS,
  OFFENSE_CATEGORY_LABELS,
} from "@/lib/intelligence-constants";

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

interface OpinionsData {
  opinions: Opinion[];
  total: number;
  reversalRate: number;
  courtCounts: { court: string; count: number }[];
  topAuthors: { name: string; count: number }[];
  counties: string[];
}

export function OpinionsClient({ data }: { data: OpinionsData }) {
  const [search, setSearch] = useState("");
  const [courtFilter, setCourtFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
    if (countyFilter !== "all" && o.county !== countyFilter) return false;
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
        <Select value={countyFilter} onValueChange={setCountyFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="County" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Counties</SelectItem>
            {data.counties.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <div className="grid gap-3">
        {filtered.length === 0 ? (
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
