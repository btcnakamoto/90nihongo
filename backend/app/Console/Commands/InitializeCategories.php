<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InitializeCategories extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'categories:init {--force : Force initialization even if categories exist}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize the 16 main content categories for Japanese learning';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 检查是否已经有分类数据
        $existingCount = DB::table('categories')->count();
        
        if ($existingCount > 0 && !$this->option('force')) {
            $this->warn("Categories already exist ({$existingCount} found).");
            if (!$this->confirm('Do you want to continue anyway?')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        $categories = [
            ['name' => '日常生活', 'slug' => 'daily-life', 'sort_order' => 1],
            ['name' => '购物消费', 'slug' => 'shopping-consumption', 'sort_order' => 2],
            ['name' => '饮食点餐', 'slug' => 'dining-ordering', 'sort_order' => 3],
            ['name' => '交通出行', 'slug' => 'transportation', 'sort_order' => 4],
            ['name' => '住房相关', 'slug' => 'housing-related', 'sort_order' => 5],
            ['name' => '医疗健康', 'slug' => 'medical-health', 'sort_order' => 6],
            ['name' => '银行与财务', 'slug' => 'banking-finance', 'sort_order' => 7],
            ['name' => '通讯与IT', 'slug' => 'communication-it', 'sort_order' => 8],
            ['name' => '职场办公', 'slug' => 'workplace-office', 'sort_order' => 9],
            ['name' => '教育与学习', 'slug' => 'education-learning', 'sort_order' => 10],
            ['name' => '社交关系', 'slug' => 'social-relationships', 'sort_order' => 11],
            ['name' => '娱乐与休闲', 'slug' => 'entertainment-leisure', 'sort_order' => 12],
            ['name' => '行政手续', 'slug' => 'administrative-procedures', 'sort_order' => 13],
            ['name' => '家庭生活', 'slug' => 'family-life', 'sort_order' => 14],
            ['name' => '网络流行/时尚用语', 'slug' => 'internet-fashion-terms', 'sort_order' => 15],
            ['name' => '灾害与紧急情况', 'slug' => 'disasters-emergencies', 'sort_order' => 16],
        ];

        $now = Carbon::now();
        $createdCount = 0;
        $skippedCount = 0;

        $this->info('Initializing categories...');
        $bar = $this->output->createProgressBar(count($categories));
        $bar->start();

        foreach ($categories as $category) {
            // 检查分类是否已存在
            $exists = DB::table('categories')
                ->where('slug', $category['slug'])
                ->first();

            if (!$exists) {
                DB::table('categories')->insert([
                    'name' => $category['name'],
                    'slug' => $category['slug'],
                    'parent_id' => null,
                    'level' => 1,
                    'sort_order' => $category['sort_order'],
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $createdCount++;
            } else {
                $skippedCount++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        $this->info("Category initialization completed!");
        $this->line("Created: {$createdCount} categories");
        $this->line("Skipped: {$skippedCount} categories (already exist)");

        // 显示所有分类
        if ($this->option('verbose') || $this->confirm('Show all categories?', false)) {
            $this->newLine();
            $this->info('Current categories:');
            $allCategories = DB::table('categories')
                ->orderBy('sort_order')
                ->get(['name', 'slug', 'is_active']);

            $this->table(
                ['Name', 'Slug', 'Status'],
                $allCategories->map(function ($cat) {
                    return [
                        $cat->name,
                        $cat->slug,
                        $cat->is_active ? '✅ Active' : '❌ Inactive'
                    ];
                })->toArray()
            );
        }

        return 0;
    }
} 